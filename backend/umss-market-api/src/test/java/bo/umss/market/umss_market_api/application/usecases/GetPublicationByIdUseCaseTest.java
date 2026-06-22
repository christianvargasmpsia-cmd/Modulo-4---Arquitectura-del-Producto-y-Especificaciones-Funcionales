package bo.umss.market.umss_market_api.application.usecases;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import bo.umss.market.umss_market_api.domain.enums.PaymentMode;
import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;

class GetPublicationByIdUseCaseTest {

    private PublicationRepositoryPort publicationRepository;
    private GetPublicationByIdUseCase useCase;

    @BeforeEach
    void setUp() {
        publicationRepository = mock(PublicationRepositoryPort.class);
        useCase = new GetPublicationByIdUseCase(publicationRepository);
    }

    @Test
    void shouldReturnPublicationWhenFound() {
        UUID id = UUID.randomUUID();
        Publication pub = Publication.builder()
                .id(id)
                .storeId(UUID.randomUUID())
                .nombre("Torta")
                .precio(BigDecimal.valueOf(25))
                .tipo(PublicationType.PRODUCTO)
                .stock(3)
                .modalidadCobro(PaymentMode.ANTICIPADO)
                .activa(true)
                .build();

        when(publicationRepository.findById(id)).thenReturn(Optional.of(pub));

        Publication result = useCase.execute(id);

        assertEquals(id, result.getId());
        assertEquals("Torta", result.getNombre());
    }

    @Test
    void shouldThrowRuntimeExceptionWhenNotFound() {
        UUID id = UUID.randomUUID();

        when(publicationRepository.findById(id)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(
                RuntimeException.class,
                () -> useCase.execute(id)
        );

        assertEquals("Publicación no encontrada", ex.getMessage());
    }
}