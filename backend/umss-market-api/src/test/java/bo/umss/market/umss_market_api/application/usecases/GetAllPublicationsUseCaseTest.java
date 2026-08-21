package bo.umss.market.umss_market_api.application.usecases;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import bo.umss.market.umss_market_api.domain.enums.PaymentMode;
import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;

class GetAllPublicationsUseCaseTest {

    private PublicationRepositoryPort publicationRepository;
    private GetAllPublicationsUseCase useCase;

    @BeforeEach
    void setUp() {
        publicationRepository = mock(PublicationRepositoryPort.class);
        useCase = new GetAllPublicationsUseCase(publicationRepository);
    }

    @Test
    void shouldReturnAllPublications() {
        Publication pub = Publication.builder()
                .id(UUID.randomUUID())
                .storeId(UUID.randomUUID())
                .nombre("Brownie")
                .precio(BigDecimal.TEN)
                .tipo(PublicationType.PRODUCTO)
                .stock(5)
                .modalidadCobro(PaymentMode.CONTRA_ENTREGA)
                .activa(true)
                .build();

        when(publicationRepository.findAll()).thenReturn(List.of(pub));

        List<Publication> result = useCase.execute();

        assertEquals(1, result.size());
        assertEquals("Brownie", result.get(0).getNombre());
        verify(publicationRepository, times(1)).findAll();
    }

    @Test
    void shouldReturnEmptyListWhenNoPublicationsExist() {
        when(publicationRepository.findAll()).thenReturn(List.of());

        List<Publication> result = useCase.execute();

        assertTrue(result.isEmpty());
    }
}
