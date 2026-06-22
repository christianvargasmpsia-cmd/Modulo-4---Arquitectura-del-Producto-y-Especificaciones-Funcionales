package bo.umss.market.umss_market_api.application.usecases;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import bo.umss.market.umss_market_api.application.dto.StorePublicProfileResponse;
import bo.umss.market.umss_market_api.domain.enums.PaymentMode;
import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import bo.umss.market.umss_market_api.domain.enums.StoreStatus;
import bo.umss.market.umss_market_api.domain.exceptions.StoreNotFoundException;
import bo.umss.market.umss_market_api.domain.model.CatalogFilter;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;

class GetStorePublicProfileUseCaseTest {

    private StoreRepositoryPort storeRepository;
    private PublicationRepositoryPort publicationRepository;
    private GetStorePublicProfileUseCase useCase;

    @BeforeEach
    void setUp() {
        storeRepository = mock(StoreRepositoryPort.class);
        publicationRepository = mock(PublicationRepositoryPort.class);
        useCase = new GetStorePublicProfileUseCase(storeRepository, publicationRepository);
    }

    // ── tienda existe ─────────────────────────────────────────────────────────

    @Test
    void shouldReturnProfileWithPublicationsWhenStoreExists() {

        UUID storeId = UUID.randomUUID();

        Store store = Store.builder()
                .id(storeId)
                .nombre("Pastelería UMSS")
                .descripcion("Postres artesanales")
                .categoria("Alimentos")
                .telefonoContacto("78901234")
                .emailContacto("pasteleria@umss.bo")
                .status(StoreStatus.ACTIVE)
                .build();

        Publication pub = Publication.builder()
                .id(UUID.randomUUID())
                .storeId(storeId)
                .nombre("Brownie")
                .precio(BigDecimal.TEN)
                .tipo(PublicationType.PRODUCTO)
                .stock(5)
                .modalidadCobro(PaymentMode.CONTRA_ENTREGA)
                .activa(true)
                .build();

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.of(store));
        when(publicationRepository.findByFilters(any(CatalogFilter.class)))
                .thenReturn(List.of(pub));

        StorePublicProfileResponse response = useCase.execute(storeId);

        assertEquals(storeId, response.getId());
        assertEquals("Pastelería UMSS", response.getNombre());
        assertEquals("Alimentos", response.getCategoria());
        assertEquals(StoreStatus.ACTIVE, response.getStatus());
        assertEquals(1, response.getPublicaciones().size());
        assertEquals("Brownie", response.getPublicaciones().get(0).getNombre());
    }

    @Test
    void shouldReturnProfileWithAllStoreFields() {

        UUID storeId = UUID.randomUUID();

        Store store = Store.builder()
                .id(storeId)
                .nombre("Tech Store")
                .descripcion("Productos tecnológicos")
                .categoria("Tecnología")
                .telefonoContacto("76543210")
                .emailContacto("tech@umss.bo")
                .status(StoreStatus.ACTIVE)
                .build();

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.of(store));
        when(publicationRepository.findByFilters(any(CatalogFilter.class)))
                .thenReturn(List.of());

        StorePublicProfileResponse response = useCase.execute(storeId);

        assertEquals("Tech Store", response.getNombre());
        assertEquals("Productos tecnológicos", response.getDescripcion());
        assertEquals("tech@umss.bo", response.getEmailContacto());
        assertEquals("76543210", response.getTelefonoContacto());
    }

    @Test
    void shouldReturnProfileWithEmptyPublicationsWhenNoneExist() {

        UUID storeId = UUID.randomUUID();

        Store store = Store.builder()
                .id(storeId)
                .nombre("Tienda Nueva")
                .status(StoreStatus.ACTIVE)
                .build();

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.of(store));
        when(publicationRepository.findByFilters(any(CatalogFilter.class)))
                .thenReturn(List.of());

        StorePublicProfileResponse response = useCase.execute(storeId);

        assertEquals("Tienda Nueva", response.getNombre());
        assertTrue(response.getPublicaciones().isEmpty());
    }

    // ── tienda no existe ──────────────────────────────────────────────────────

    @Test
    void shouldThrowStoreNotFoundWhenIdDoesNotExist() {

        UUID storeId = UUID.randomUUID();

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.empty());

        StoreNotFoundException ex = assertThrows(
                StoreNotFoundException.class,
                () -> useCase.execute(storeId)
        );

        assertEquals("Tienda no encontrada", ex.getMessage());
        verifyNoInteractions(publicationRepository);
    }
}
