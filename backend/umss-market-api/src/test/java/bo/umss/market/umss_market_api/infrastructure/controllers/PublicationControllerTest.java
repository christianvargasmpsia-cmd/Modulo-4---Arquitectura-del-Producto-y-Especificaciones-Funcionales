package bo.umss.market.umss_market_api.infrastructure.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import bo.umss.market.umss_market_api.application.dto.CatalogFilterRequest;
import bo.umss.market.umss_market_api.application.dto.CreatePublicationRequest;
import bo.umss.market.umss_market_api.application.dto.CreatePublicationResponse;
import bo.umss.market.umss_market_api.application.dto.PublicationSummaryResponse;
import bo.umss.market.umss_market_api.application.usecases.CreatePublicationUseCase;
import bo.umss.market.umss_market_api.application.usecases.GetPublicationByIdUseCase;
import bo.umss.market.umss_market_api.application.usecases.SearchCatalogUseCase;
import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import bo.umss.market.umss_market_api.domain.exceptions.InvalidPriceRangeException;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.infrastructure.config.LegacyGlobalExceptionHandler;

class PublicationControllerTest {

    private CreatePublicationUseCase createUseCase;
    private SearchCatalogUseCase searchUseCase;
    private GetPublicationByIdUseCase getByIdUseCase;
    private PublicationController controller;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        createUseCase = mock(CreatePublicationUseCase.class);
        searchUseCase = mock(SearchCatalogUseCase.class);
        getByIdUseCase = mock(GetPublicationByIdUseCase.class);
        controller = new PublicationController(createUseCase, searchUseCase, getByIdUseCase);
        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setControllerAdvice(new LegacyGlobalExceptionHandler())
                .build();
    }

    // ── tests unitarios directos ──────────────────────────────────────────────

    @Test
    void shouldCreatePublication() {

        CreatePublicationResponse response =
                CreatePublicationResponse.builder()
                        .success(true)
                        .message("OK")
                        .publicationId(UUID.randomUUID())
                        .build();

        when(createUseCase.execute(any()))
                .thenReturn(response);

        var result = controller.createPublication(
                new CreatePublicationRequest());

        assertEquals(201, result.getStatusCode().value());
        assertTrue(result.getBody().isSuccess());
    }

    @Test
    void shouldSearchCatalog() {

        PublicationSummaryResponse summary =
                PublicationSummaryResponse.builder()
                        .id(UUID.randomUUID())
                        .nombre("Brownie")
                        .precio(BigDecimal.TEN)
                        .tipo(PublicationType.PRODUCTO)
                        .build();

        when(searchUseCase.execute(any()))
                .thenReturn(List.of(summary));

        var result = controller.search(new CatalogFilterRequest());

        assertEquals(1, result.getBody().size());
    }

    @Test
    void shouldGetPublicationById() {

        UUID id = UUID.randomUUID();

        Publication publication =
                Publication.builder()
                        .id(id)
                        .nombre("Brownie")
                        .precio(BigDecimal.TEN)
                        .tipo(PublicationType.PRODUCTO)
                        .build();

        when(getByIdUseCase.execute(id))
                .thenReturn(publication);

        var result = controller.findById(id);

        assertEquals(id, result.getBody().getId());
    }

    // ── MockMvc GET /api/publications ─────────────────────────────────────────

    @Test
    void shouldReturn200WithEmptyListWhenNoPublications() throws Exception {

        when(searchUseCase.execute(any(CatalogFilterRequest.class)))
                .thenReturn(List.of());

        mockMvc.perform(get("/api/publications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void shouldReturn200WithResultsWhenPublicationsExist() throws Exception {

        PublicationSummaryResponse summary =
                PublicationSummaryResponse.builder()
                        .id(UUID.randomUUID())
                        .nombre("Brownie")
                        .precio(BigDecimal.TEN)
                        .tipo(PublicationType.PRODUCTO)
                        .activa(true)
                        .build();

        when(searchUseCase.execute(any(CatalogFilterRequest.class)))
                .thenReturn(List.of(summary));

        mockMvc.perform(get("/api/publications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].nombre").value("Brownie"));
    }

    @Test
    void shouldReturn200WithTextoParam() throws Exception {

        PublicationSummaryResponse summary =
                PublicationSummaryResponse.builder()
                        .id(UUID.randomUUID())
                        .nombre("Torta")
                        .precio(BigDecimal.valueOf(20))
                        .tipo(PublicationType.PRODUCTO)
                        .activa(true)
                        .build();

        when(searchUseCase.execute(any(CatalogFilterRequest.class)))
                .thenReturn(List.of(summary));

        mockMvc.perform(get("/api/publications").param("texto", "torta"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Torta"));
    }

    @Test
    void shouldReturn200WithTipoParam() throws Exception {

        PublicationSummaryResponse summary =
                PublicationSummaryResponse.builder()
                        .id(UUID.randomUUID())
                        .nombre("Clases de inglés")
                        .precio(BigDecimal.valueOf(50))
                        .tipo(PublicationType.SERVICIO)
                        .activa(true)
                        .build();

        when(searchUseCase.execute(any(CatalogFilterRequest.class)))
                .thenReturn(List.of(summary));

        mockMvc.perform(get("/api/publications").param("tipo", "SERVICIO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].tipo").value("SERVICIO"));
    }

    @Test
    void shouldReturn200WithPrecioRangeParams() throws Exception {

        PublicationSummaryResponse summary =
                PublicationSummaryResponse.builder()
                        .id(UUID.randomUUID())
                        .nombre("Muffin")
                        .precio(BigDecimal.valueOf(15))
                        .tipo(PublicationType.PRODUCTO)
                        .activa(true)
                        .build();

        when(searchUseCase.execute(any(CatalogFilterRequest.class)))
                .thenReturn(List.of(summary));

        mockMvc.perform(get("/api/publications")
                        .param("precioMin", "10")
                        .param("precioMax", "20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nombre").value("Muffin"));
    }

    @Test
    void shouldReturn400WhenPrecioMinExceedsPrecioMax() throws Exception {

        when(searchUseCase.execute(any(CatalogFilterRequest.class)))
                .thenThrow(new InvalidPriceRangeException(
                        "precioMin no puede ser mayor que precioMax"));

        mockMvc.perform(get("/api/publications")
                        .param("precioMin", "100")
                        .param("precioMax", "50"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value(
                        "precioMin no puede ser mayor que precioMax"));
    }
}
