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

import com.fasterxml.jackson.databind.ObjectMapper;

import bo.umss.market.umss_market_api.application.dto.CreatePublicationRequest;
import bo.umss.market.umss_market_api.application.dto.CreatePublicationResponse;
import bo.umss.market.umss_market_api.domain.enums.PaymentMode;
import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import bo.umss.market.umss_market_api.domain.enums.StoreStatus;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;

class CreatePublicationUseCaseTest {

    private PublicationRepositoryPort publicationRepository;
    private StoreRepositoryPort storeRepository;
    private AIProviderPort aiProvider;
    private ObjectMapper objectMapper;

    private CreatePublicationUseCase useCase;

    @BeforeEach
    void setUp() {

        publicationRepository = mock(PublicationRepositoryPort.class);
        storeRepository = mock(StoreRepositoryPort.class);
        aiProvider = mock(AIProviderPort.class);

        objectMapper = new ObjectMapper();

        useCase = new CreatePublicationUseCase(
                publicationRepository,
                storeRepository,
                aiProvider,
                objectMapper
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

        // Mock del embedding generado por Ollama
        when(aiProvider.generateEmbedding(any(String.class)))
                .thenReturn(List.of(
                        0.1,
                        0.2,
                        0.3
                ));

        when(publicationRepository.save(any(Publication.class)))
                .thenAnswer(invocation -> {

                    Publication publication =
                            invocation.getArgument(0);

                    return Publication.builder()
                            .id(publicationId)
                            .storeId(publication.getStoreId())
                            .nombre(publication.getNombre())
                            .descripcion(publication.getDescripcion())
                            .precio(publication.getPrecio())
                            .tipo(publication.getTipo())
                            .stock(publication.getStock())
                            .modalidadCobro(publication.getModalidadCobro())
                            .activa(publication.getActiva())
                            .createdAt(publication.getCreatedAt())
                            .updatedAt(publication.getUpdatedAt())
                            .embedding(publication.getEmbedding())
                            .build();
                });

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

        // Verificar que se generó el embedding
        verify(aiProvider)
                .generateEmbedding(any(String.class));

        // Verificar que la publicación guardada tiene embedding
        verify(publicationRepository)
                .save(argThat(publication ->
                        publication.getEmbedding() != null
                                && !publication.getEmbedding().isBlank()
                ));
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

        // No debe generar embedding porque la validación
        // de stock falla antes.
        verify(aiProvider, never())
                .generateEmbedding(any(String.class));
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

        // Mock del embedding
        when(aiProvider.generateEmbedding(any(String.class)))
                .thenReturn(List.of(
                        0.4,
                        0.5,
                        0.6
                ));

        when(publicationRepository.save(any(Publication.class)))
                .thenAnswer(invocation -> {

                    Publication publication =
                            invocation.getArgument(0);

                    return Publication.builder()
                            .id(publicationId)
                            .storeId(publication.getStoreId())
                            .nombre(publication.getNombre())
                            .descripcion(publication.getDescripcion())
                            .precio(publication.getPrecio())
                            .tipo(publication.getTipo())
                            .stock(publication.getStock())
                            .modalidadCobro(publication.getModalidadCobro())
                            .activa(publication.getActiva())
                            .createdAt(publication.getCreatedAt())
                            .updatedAt(publication.getUpdatedAt())
                            .embedding(publication.getEmbedding())
                            .build();
                });

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

        verify(aiProvider)
                .generateEmbedding(any(String.class));

        verify(publicationRepository)
                .save(argThat(publication ->
                        publication.getEmbedding() != null
                                && !publication.getEmbedding().isBlank()
                ));
    }
}
