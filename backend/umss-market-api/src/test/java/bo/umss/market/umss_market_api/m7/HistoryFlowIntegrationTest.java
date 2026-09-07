package bo.umss.market.umss_market_api.m7;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.*;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import bo.umss.market.umss_market_api.application.dto.ToolDecision;
import bo.umss.market.umss_market_api.application.services.AIServiceImpl;
import bo.umss.market.umss_market_api.application.usecases.GetUserInteractionsSemanticUseCase;
import bo.umss.market.umss_market_api.application.usecases.SearchCatalogUseCase;
import bo.umss.market.umss_market_api.domain.enums.InteractionType;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import bo.umss.market.umss_market_api.infrastructure.adapters.*;
import bo.umss.market.umss_market_api.infrastructure.controllers.AIController;
import bo.umss.market.umss_market_api.infrastructure.persistence.entities.*;
import bo.umss.market.umss_market_api.infrastructure.persistence.repositories.*;

@Tag("agente")
@Tag("integration")
@DataJpaTest(properties = {"spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.datasource.generate-unique-name=true"})
@ContextConfiguration(classes = HistoryFlowIntegrationTest.PersistenceSlice.class)
class HistoryFlowIntegrationTest {
    @Configuration
    @EnableJpaRepositories(basePackageClasses = JpaInteractionRepository.class)
    @EntityScan(basePackageClasses = InteractionEntity.class)
    static class PersistenceSlice {}

    @Autowired JpaInteractionRepository interactionJpa;
    @Autowired JpaPublicationRepository publicationJpa;

    private final UUID user = UUID.fromString("00000000-0000-0000-0000-000000000011");
    private final UUID otherUser = UUID.fromString("00000000-0000-0000-0000-000000000012");
    private JpaInteractionRepositoryAdapter interactions;
    private JpaPublicationRepositoryAdapter publications;
    private AIProviderPort model;
    private MockMvc mvc;

    @BeforeEach
    void prepareRealFlow() {
        // Spies observe calls while invoking the REAL JPA adapters, mappers and H2.
        interactions = spy(new JpaInteractionRepositoryAdapter(interactionJpa));
        publications = spy(new JpaPublicationRepositoryAdapter(publicationJpa));
        model = mock(AIProviderPort.class); // Only the model boundary is simulated.
        var history = new GetUserInteractionsSemanticUseCase(interactions, publications, model);
        AIServiceImpl router = new AIServiceImpl(model, (SearchCatalogUseCase) null);
        ReflectionTestUtils.setField(router, "iaEnabled", true);
        ReflectionTestUtils.setField(router, "userInteractionsUseCase", history);
        mvc = MockMvcBuilders.standaloneSetup(new AIController(router)).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of()));
        ToolDecision decision = new ToolDecision();
        decision.setTool("USER_INTERACTIONS");
        decision.setQuery("historial");
        when(model.selectTool("Mi historial")).thenReturn(decision);
    }

    @AfterEach
    void clearIdentity() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void authenticatedRequestRetrievesOwnH2HistoryBeforeGeneratingResponse() throws Exception {
        seed(user, "Libro propio");
        seed(otherUser, "Producto privado ajeno");
        when(model.generate(anyString())).thenReturn("respuesta local controlada");

        String result = mvc.perform(post("/api/ai/chat").contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\":\"Mi historial\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();

        assertEquals("respuesta local controlada", result);
        ArgumentCaptor<String> prompt = ArgumentCaptor.forClass(String.class);
        var order = inOrder(model, interactions, publications);
        order.verify(model).selectTool("Mi historial");
        order.verify(interactions).findRecentByUserId(user, 20);
        order.verify(publications).findById(publicationJpa.findAll().stream()
                .filter(p -> p.getNombre().equals("Libro propio")).findFirst().orElseThrow().getId());
        order.verify(model).generate(prompt.capture());
        assertTrue(prompt.getValue().contains("Libro propio"));
        assertFalse(prompt.getValue().contains("Producto privado ajeno"));
        assertEquals(2, interactionJpa.count());
        assertEquals(2, publicationJpa.count());
    }

    @Test
    void emptyOwnHistoryStopsAfterH2LookupEvenWhenAnotherUserHasRecords() throws Exception {
        seed(otherUser, "Producto privado ajeno");
        String result = mvc.perform(post("/api/ai/chat").contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\":\"Mi historial\"}"))
                .andExpect(status().isOk()).andReturn().getResponse()
                .getContentAsString(java.nio.charset.StandardCharsets.UTF_8);

        assertEquals("No tienes historial de interacciones aún.", result);
        var order = inOrder(model, interactions);
        order.verify(model).selectTool("Mi historial");
        order.verify(interactions).findRecentByUserId(user, 20);
        verify(model, never()).generate(anyString());
        verifyNoInteractions(publications);
        assertEquals(1, interactionJpa.count());
    }

    private void seed(UUID owner, String name) {
        var publication = publicationJpa.saveAndFlush(PublicationEntity.builder()
                .id(UUID.randomUUID()).storeId(UUID.randomUUID()).nombre(name)
                .precio(new BigDecimal("10.00")).stock(1).activa(true).build());
        interactionJpa.saveAndFlush(InteractionEntity.builder().userId(owner)
                .publicationId(publication.getId()).type(InteractionType.VIEW).build());
    }
}
