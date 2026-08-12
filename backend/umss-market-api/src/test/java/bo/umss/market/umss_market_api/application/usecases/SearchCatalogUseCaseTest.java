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

import bo.umss.market.umss_market_api.application.dto.CatalogFilterRequest;
import bo.umss.market.umss_market_api.application.dto.PublicationSummaryResponse;
import bo.umss.market.umss_market_api.domain.enums.PaymentMode;
import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import bo.umss.market.umss_market_api.domain.exceptions.InvalidPriceRangeException;
import bo.umss.market.umss_market_api.domain.model.CatalogFilter;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;

class SearchCatalogUseCaseTest {

    private PublicationRepositoryPort publicationRepository;
    private StoreRepositoryPort storeRepository;
    private AIProviderPort aiProvider;

    private SearchCatalogUseCase useCase;

    @BeforeEach
    void setUp() {

        publicationRepository =
                mock(PublicationRepositoryPort.class);

        storeRepository =
                mock(StoreRepositoryPort.class);

        aiProvider =
                mock(AIProviderPort.class);

        useCase =
                new SearchCatalogUseCase(
                        publicationRepository,
                        storeRepository,
                        aiProvider
                );
    }

    // ── sin filtros ───────────────────────────────────────────────────────────

    @Test
    void shouldReturnAllPublicationsWhenNoFiltersApplied() {

        UUID storeId = UUID.randomUUID();

        Publication pub = Publication.builder()
                .id(UUID.randomUUID())
                .storeId(storeId)
                .nombre("Brownie")
                .descripcion("Artesanal")
                .precio(BigDecimal.TEN)
                .tipo(PublicationType.PRODUCTO)
                .stock(5)
                .modalidadCobro(PaymentMode.CONTRA_ENTREGA)
                .activa(true)
                .build();

        Store store =
                Store.builder()
                        .id(storeId)
                        .nombre("Mi Tienda")
                        .build();

        when(publicationRepository.findByFilters(
                any(CatalogFilter.class)))
                .thenReturn(List.of(pub));

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.of(store));

        List<PublicationSummaryResponse> result =
                useCase.execute(
                        new CatalogFilterRequest()
                );

        assertEquals(1, result.size());
        assertEquals(
                "Brownie",
                result.get(0).getNombre()
        );

        assertEquals(
                "Mi Tienda",
                result.get(0).getNombreTienda()
        );
    }

    @Test
    void shouldReturnEmptyListWhenNoPublicationsFound() {

        when(publicationRepository.findByFilters(
                any(CatalogFilter.class)))
                .thenReturn(List.of());

        List<PublicationSummaryResponse> result =
                useCase.execute(
                        new CatalogFilterRequest()
                );

        assertTrue(result.isEmpty());
    }

    // ── filtro texto ──────────────────────────────────────────────────────────

    @Test
    void shouldNormalizeWhitespaceInTextoFilter() {

        UUID storeId = UUID.randomUUID();

        Publication pub =
                Publication.builder()
                        .id(UUID.randomUUID())
                        .storeId(storeId)
                        .nombre("Torta")
                        .precio(BigDecimal.valueOf(20))
                        .tipo(PublicationType.PRODUCTO)
                        .stock(3)
                        .modalidadCobro(PaymentMode.ANTICIPADO)
                        .activa(true)
                        .build();

        when(publicationRepository.findByFilters(
                any(CatalogFilter.class)))
                .thenReturn(List.of(pub));

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.empty());

        CatalogFilterRequest request =
                new CatalogFilterRequest();

        request.setTexto("  torta  ");

        List<PublicationSummaryResponse> result =
                useCase.execute(request);

        assertEquals(1, result.size());

        assertNull(
                result.get(0).getNombreTienda()
        );
    }

    @Test
    void shouldHandleNullTextoFilter() {

        when(publicationRepository.findByFilters(
                any(CatalogFilter.class)))
                .thenReturn(List.of());

        CatalogFilterRequest request =
                new CatalogFilterRequest();

        request.setTexto(null);

        assertDoesNotThrow(
                () -> useCase.execute(request)
        );
    }

    // ── filtro tipo ───────────────────────────────────────────────────────────

    @Test
    void shouldFilterByTipoServicio() {

        UUID storeId = UUID.randomUUID();

        Publication servicio =
                Publication.builder()
                        .id(UUID.randomUUID())
                        .storeId(storeId)
                        .nombre("Clases de inglés")
                        .precio(BigDecimal.valueOf(50))
                        .tipo(PublicationType.SERVICIO)
                        .stock(0)
                        .modalidadCobro(PaymentMode.COMPLETO)
                        .activa(true)
                        .build();

        when(publicationRepository.findByFilters(
                any(CatalogFilter.class)))
                .thenReturn(List.of(servicio));

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.empty());

        CatalogFilterRequest request =
                new CatalogFilterRequest();

        request.setTipo(
                PublicationType.SERVICIO
        );

        List<PublicationSummaryResponse> result =
                useCase.execute(request);

        assertEquals(1, result.size());

        assertEquals(
                PublicationType.SERVICIO,
                result.get(0).getTipo()
        );
    }

    @Test
    void shouldFilterByTipoProducto() {

        UUID storeId = UUID.randomUUID();

        Publication producto =
                Publication.builder()
                        .id(UUID.randomUUID())
                        .storeId(storeId)
                        .nombre("Pan")
                        .precio(BigDecimal.valueOf(5))
                        .tipo(PublicationType.PRODUCTO)
                        .stock(20)
                        .modalidadCobro(
                                PaymentMode.CONTRA_ENTREGA
                        )
                        .activa(true)
                        .build();

        when(publicationRepository.findByFilters(
                any(CatalogFilter.class)))
                .thenReturn(List.of(producto));

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.empty());

        CatalogFilterRequest request =
                new CatalogFilterRequest();

        request.setTipo(
                PublicationType.PRODUCTO
        );

        List<PublicationSummaryResponse> result =
                useCase.execute(request);

        assertEquals(1, result.size());

        assertEquals(
                PublicationType.PRODUCTO,
                result.get(0).getTipo()
        );
    }

    // ── filtro precio ─────────────────────────────────────────────────────────

    @Test
    void shouldFilterByPrecioMinAndPrecioMax() {

        UUID storeId = UUID.randomUUID();

        Publication pub =
                Publication.builder()
                        .id(UUID.randomUUID())
                        .storeId(storeId)
                        .nombre("Muffin")
                        .precio(BigDecimal.valueOf(15))
                        .tipo(PublicationType.PRODUCTO)
                        .stock(10)
                        .modalidadCobro(
                                PaymentMode.CONTRA_ENTREGA
                        )
                        .activa(true)
                        .build();

        when(publicationRepository.findByFilters(
                any(CatalogFilter.class)))
                .thenReturn(List.of(pub));

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.empty());

        CatalogFilterRequest request =
                new CatalogFilterRequest();

        request.setPrecioMin(
                BigDecimal.TEN
        );

        request.setPrecioMax(
                BigDecimal.valueOf(20)
        );

        List<PublicationSummaryResponse> result =
                useCase.execute(request);

        assertEquals(1, result.size());

        assertEquals(
                BigDecimal.valueOf(15),
                result.get(0).getPrecio()
        );
    }

    @Test
    void shouldFilterByPrecioMinOnly() {

        UUID storeId = UUID.randomUUID();

        Publication pub =
                Publication.builder()
                        .id(UUID.randomUUID())
                        .storeId(storeId)
                        .nombre("Laptop")
                        .precio(BigDecimal.valueOf(500))
                        .tipo(PublicationType.PRODUCTO)
                        .stock(1)
                        .modalidadCobro(
                                PaymentMode.COMPLETO
                        )
                        .activa(true)
                        .build();

        when(publicationRepository.findByFilters(
                any(CatalogFilter.class)))
                .thenReturn(List.of(pub));

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.empty());

        CatalogFilterRequest request =
                new CatalogFilterRequest();

        request.setPrecioMin(
                BigDecimal.valueOf(100)
        );

        List<PublicationSummaryResponse> result =
                useCase.execute(request);

        assertEquals(1, result.size());
    }

    // ── validación precioMin > precioMax ──────────────────────────────────────

    @Test
    void shouldThrowInvalidPriceRangeWhenPrecioMinExceedsPrecioMax() {

        CatalogFilterRequest request =
                new CatalogFilterRequest();

        request.setPrecioMin(
                BigDecimal.valueOf(100)
        );

        request.setPrecioMax(
                BigDecimal.valueOf(50)
        );

        assertThrows(
                InvalidPriceRangeException.class,
                () -> useCase.execute(request)
        );
    }

    @Test
    void shouldNotThrowWhenPrecioMinEqualsPrecioMax() {

        when(publicationRepository.findByFilters(
                any(CatalogFilter.class)))
                .thenReturn(List.of());

        CatalogFilterRequest request =
                new CatalogFilterRequest();

        request.setPrecioMin(
                BigDecimal.valueOf(50)
        );

        request.setPrecioMax(
                BigDecimal.valueOf(50)
        );

        assertDoesNotThrow(
                () -> useCase.execute(request)
        );
    }

    // ── filtro storeId ────────────────────────────────────────────────────────

    @Test
    void shouldFilterByStoreId() {

        UUID storeId = UUID.randomUUID();

        Publication pub =
                Publication.builder()
                        .id(UUID.randomUUID())
                        .storeId(storeId)
                        .nombre("Cupcake")
                        .precio(BigDecimal.valueOf(8))
                        .tipo(PublicationType.PRODUCTO)
                        .stock(15)
                        .modalidadCobro(
                                PaymentMode.CONTRA_ENTREGA
                        )
                        .activa(true)
                        .build();

        when(publicationRepository.findByFilters(
                any(CatalogFilter.class)))
                .thenReturn(List.of(pub));

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.empty());

        CatalogFilterRequest request =
                new CatalogFilterRequest();

        request.setStoreId(storeId);

        List<PublicationSummaryResponse> result =
                useCase.execute(request);

        assertEquals(1, result.size());

        assertEquals(
                storeId,
                result.get(0).getStoreId()
        );
    }
}