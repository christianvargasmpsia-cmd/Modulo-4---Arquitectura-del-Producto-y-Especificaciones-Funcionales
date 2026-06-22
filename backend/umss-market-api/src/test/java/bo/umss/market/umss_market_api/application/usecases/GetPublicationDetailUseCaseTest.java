package bo.umss.market.umss_market_api.application.usecases;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import bo.umss.market.umss_market_api.application.dto.PublicationDetailResponse;
import bo.umss.market.umss_market_api.domain.enums.PaymentMode;
import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import bo.umss.market.umss_market_api.domain.exceptions.PublicationNotFoundException;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;

class GetPublicationDetailUseCaseTest {

    private PublicationRepositoryPort publicationRepository;
    private StoreRepositoryPort storeRepository;
    private GetPublicationDetailUseCase useCase;

    @BeforeEach
    void setUp() {
        publicationRepository = mock(PublicationRepositoryPort.class);
        storeRepository = mock(StoreRepositoryPort.class);
        useCase = new GetPublicationDetailUseCase(publicationRepository, storeRepository);
    }

    // ── existe activa ─────────────────────────────────────────────────────────

    @Test
    void shouldReturnDetailWhenPublicationExistsAndIsActive() {

        UUID pubId = UUID.randomUUID();
        UUID storeId = UUID.randomUUID();

        Publication pub = Publication.builder()
                .id(pubId)
                .storeId(storeId)
                .nombre("Brownie")
                .descripcion("Artesanal de chocolate")
                .precio(BigDecimal.TEN)
                .tipo(PublicationType.PRODUCTO)
                .stock(5)
                .modalidadCobro(PaymentMode.CONTRA_ENTREGA)
                .activa(true)
                .createdAt(LocalDateTime.now())
                .build();

        Store store = Store.builder()
                .id(storeId)
                .nombre("Pastelería UMSS")
                .build();

        when(publicationRepository.findById(pubId))
                .thenReturn(Optional.of(pub));
        when(storeRepository.findById(storeId))
                .thenReturn(Optional.of(store));

        PublicationDetailResponse response = useCase.execute(pubId);

        assertEquals(pubId, response.getId());
        assertEquals("Brownie", response.getNombre());
        assertEquals("Pastelería UMSS", response.getNombreTienda());
        assertTrue(response.getActiva());
        assertNotNull(response.getCreatedAt());
    }

    @Test
    void shouldReturnNullNombreTiendaWhenStoreNotFound() {

        UUID pubId = UUID.randomUUID();
        UUID storeId = UUID.randomUUID();

        Publication pub = Publication.builder()
                .id(pubId)
                .storeId(storeId)
                .nombre("Torta")
                .descripcion("De chocolate")
                .precio(BigDecimal.valueOf(25))
                .tipo(PublicationType.PRODUCTO)
                .stock(2)
                .modalidadCobro(PaymentMode.ANTICIPADO)
                .activa(true)
                .createdAt(LocalDateTime.now())
                .build();

        when(publicationRepository.findById(pubId))
                .thenReturn(Optional.of(pub));
        when(storeRepository.findById(storeId))
                .thenReturn(Optional.empty());

        PublicationDetailResponse response = useCase.execute(pubId);

        assertEquals(pubId, response.getId());
        assertNull(response.getNombreTienda());
    }

    // ── no existe ─────────────────────────────────────────────────────────────

    @Test
    void shouldThrowPublicationNotFoundWhenIdDoesNotExist() {

        UUID pubId = UUID.randomUUID();

        when(publicationRepository.findById(pubId))
                .thenReturn(Optional.empty());

        PublicationNotFoundException ex = assertThrows(
                PublicationNotFoundException.class,
                () -> useCase.execute(pubId)
        );

        assertEquals("Publicación no encontrada", ex.getMessage());
    }

    // ── inactiva ──────────────────────────────────────────────────────────────

    @Test
    void shouldThrowPublicationNotFoundWhenPublicationIsInactive() {

        UUID pubId = UUID.randomUUID();
        UUID storeId = UUID.randomUUID();

        Publication pub = Publication.builder()
                .id(pubId)
                .storeId(storeId)
                .nombre("Producto descontinuado")
                .precio(BigDecimal.TEN)
                .tipo(PublicationType.PRODUCTO)
                .stock(0)
                .modalidadCobro(PaymentMode.CONTRA_ENTREGA)
                .activa(false)
                .build();

        when(publicationRepository.findById(pubId))
                .thenReturn(Optional.of(pub));

        PublicationNotFoundException ex = assertThrows(
                PublicationNotFoundException.class,
                () -> useCase.execute(pubId)
        );

        assertEquals("Publicación no encontrada", ex.getMessage());
        verifyNoInteractions(storeRepository);
    }
}
