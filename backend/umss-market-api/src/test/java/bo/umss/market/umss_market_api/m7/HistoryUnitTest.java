package bo.umss.market.umss_market_api.m7;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import bo.umss.market.umss_market_api.application.usecases.GetUserInteractionsSemanticUseCase;
import bo.umss.market.umss_market_api.domain.enums.InteractionType;
import bo.umss.market.umss_market_api.domain.model.Interaction;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.ports.*;

@Tag("agente")
@Tag("unit")
class HistoryUnitTest {
    private final UUID user = UUID.fromString("00000000-0000-0000-0000-000000000001");
    private final UUID publicationId = UUID.fromString("00000000-0000-0000-0000-000000000002");
    private InteractionRepositoryPort interactions;
    private PublicationRepositoryPort publications;
    private AIProviderPort model;
    private GetUserInteractionsSemanticUseCase useCase;

    @BeforeEach
    void prepare() {
        interactions = mock(InteractionRepositoryPort.class);
        publications = mock(PublicationRepositoryPort.class);
        model = mock(AIProviderPort.class);
        useCase = new GetUserInteractionsSemanticUseCase(interactions, publications, model);
    }

    @Test
    void emptyHistoryReturnsNoticeWithoutReadingPublicationsOrCallingModel() {
        when(interactions.findRecentByUserId(user, 20)).thenReturn(List.of());
        assertEquals("No tienes historial de interacciones aún.",
                useCase.executeUserHistory(user, "Mi historial"));
        verify(interactions).findRecentByUserId(user, 20);
        verifyNoInteractions(publications, model);
    }

    @Test
    void historyIncludesStoredFactsAndQuestionBeforeCallingModel() {
        when(interactions.findRecentByUserId(user, 20)).thenReturn(List.of(interaction()));
        when(publications.findById(publicationId)).thenReturn(Optional.of(publication()));
        when(model.generate(anyString())).thenReturn("respuesta del doble");

        assertEquals("respuesta del doble", useCase.executeUserHistory(user, "¿Qué consulté?"));
        ArgumentCaptor<String> context = ArgumentCaptor.forClass(String.class);
        var order = inOrder(interactions, publications, model);
        order.verify(interactions).findRecentByUserId(user, 20);
        order.verify(publications).findById(publicationId);
        order.verify(model).generate(context.capture());
        assertAll(
                () -> assertTrue(context.getValue().contains("Libro de álgebra")),
                () -> assertTrue(context.getValue().contains("[VIEW]")),
                () -> assertTrue(context.getValue().contains("Bs. 25.50")),
                () -> assertTrue(context.getValue().contains("2026-09-01T10:30")),
                () -> assertTrue(context.getValue().contains("¿Qué consulté?")));
    }

    @Test
    void removedPublicationDoesNotInventFactsInModelContext() {
        when(interactions.findRecentByUserId(user, 20)).thenReturn(List.of(interaction()));
        when(publications.findById(publicationId)).thenReturn(Optional.empty());
        when(model.generate(anyString())).thenReturn("sin detalles disponibles");

        assertEquals("sin detalles disponibles", useCase.executeUserHistory(user, "Mi historial"));
        ArgumentCaptor<String> context = ArgumentCaptor.forClass(String.class);
        verify(model).generate(context.capture());
        assertTrue(context.getValue().contains("Mi historial"));
        assertFalse(context.getValue().contains("Precio:"));
        assertFalse(context.getValue().contains("null"));
        verify(publications).findById(publicationId);
    }

    @Test
    void modelFailureIsPropagatedInsteadOfReturningInventedSuccess() {
        when(interactions.findRecentByUserId(user, 20)).thenReturn(List.of(interaction()));
        when(publications.findById(publicationId)).thenReturn(Optional.of(publication()));
        IllegalStateException failure = new IllegalStateException("proveedor no disponible");
        when(model.generate(anyString())).thenThrow(failure);
        assertSame(failure, assertThrows(IllegalStateException.class,
                () -> useCase.executeUserHistory(user, "Mi historial")));
        verify(model, times(1)).generate(anyString());
    }

    private Interaction interaction() {
        return Interaction.builder().userId(user).publicationId(publicationId)
                .type(InteractionType.VIEW)
                .createdAt(LocalDateTime.of(2026, 9, 1, 10, 30)).build();
    }

    private Publication publication() {
        return Publication.builder().id(publicationId).nombre("Libro de álgebra")
                .precio(new BigDecimal("25.50")).build();
    }
}
