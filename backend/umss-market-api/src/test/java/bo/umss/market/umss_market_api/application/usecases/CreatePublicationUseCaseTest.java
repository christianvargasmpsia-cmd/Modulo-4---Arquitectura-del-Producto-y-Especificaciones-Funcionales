package bo.umss.market.umss_market_api.application.usecases;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import bo.umss.market.umss_market_api.application.dto.CreatePublicationRequest;
import bo.umss.market.umss_market_api.application.dto.CreatePublicationResponse;
import bo.umss.market.umss_market_api.domain.enums.PaymentMode;
import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import bo.umss.market.umss_market_api.domain.enums.StoreStatus;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;

class CreatePublicationUseCaseTest {

    private PublicationRepositoryPort publicationRepository;
    private StoreRepositoryPort storeRepository;

    private CreatePublicationUseCase useCase;

    @BeforeEach
    void setUp() {

        publicationRepository = mock(PublicationRepositoryPort.class);
        storeRepository = mock(StoreRepositoryPort.class);

        useCase = new CreatePublicationUseCase(
                publicationRepository,
                storeRepository
        );
    }

    @Test
    void shouldCreateProductSuccessfully() {

        UUID storeId = UUID.randomUUID();
        UUID publicationId = UUID.randomUUID();

        Store store = Store.builder()
                .id(storeId)
                .status(StoreStatus.ACTIVE)
                .build();

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.of(store));

        when(publicationRepository.save(any(Publication.class)))
                .thenReturn(
                        Publication.builder()
                                .id(publicationId)
                                .build()
                );

        CreatePublicationRequest request =
                new CreatePublicationRequest();

        request.setStoreId(storeId);
        request.setNombre("Brownie");
        request.setDescripcion("Brownie artesanal");
        request.setPrecio(BigDecimal.valueOf(10));
        request.setTipo(PublicationType.PRODUCTO);
        request.setStock(5);

        CreatePublicationResponse response =
                useCase.execute(request);

        assertTrue(response.isSuccess());
        assertEquals(
                publicationId,
                response.getPublicationId()
        );
    }

    @Test
    void shouldThrowWhenProductStockIsInvalid() {

        UUID storeId = UUID.randomUUID();

        Store store = Store.builder()
                .id(storeId)
                .status(StoreStatus.ACTIVE)
                .build();

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.of(store));

        CreatePublicationRequest request =
                new CreatePublicationRequest();

        request.setStoreId(storeId);
        request.setTipo(PublicationType.PRODUCTO);
        request.setStock(0);

        RuntimeException exception =
                assertThrows(
                        RuntimeException.class,
                        () -> useCase.execute(request)
                );

        assertEquals(
                "Los productos deben tener stock mayor a cero",
                exception.getMessage()
        );
    }

    @Test
    void shouldCreateServiceSuccessfully() {

        UUID storeId = UUID.randomUUID();
        UUID publicationId = UUID.randomUUID();

        Store store = Store.builder()
                .id(storeId)
                .status(StoreStatus.ACTIVE)
                .build();

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.of(store));

        when(publicationRepository.save(any(Publication.class)))
                .thenReturn(
                        Publication.builder()
                                .id(publicationId)
                                .build()
                );

        CreatePublicationRequest request =
                new CreatePublicationRequest();

        request.setStoreId(storeId);
        request.setNombre("Diseño de Logos");
        request.setDescripcion("Diseño gráfico");
        request.setPrecio(BigDecimal.valueOf(50));
        request.setTipo(PublicationType.SERVICIO);
        request.setModalidadCobro(PaymentMode.ANTICIPADO);

        CreatePublicationResponse response =
                useCase.execute(request);

        assertTrue(response.isSuccess());
        assertEquals(
                publicationId,
                response.getPublicationId()
        );
    }
}