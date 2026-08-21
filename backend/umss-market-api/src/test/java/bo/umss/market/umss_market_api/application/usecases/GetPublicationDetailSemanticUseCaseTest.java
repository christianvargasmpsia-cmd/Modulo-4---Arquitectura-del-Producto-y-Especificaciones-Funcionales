package bo.umss.market.umss_market_api.application.usecases;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import bo.umss.market.umss_market_api.domain.enums.PaymentMode;
import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;

@ExtendWith(MockitoExtension.class)
@DisplayName("GetPublicationDetailSemanticUseCase - RAG #2")
class GetPublicationDetailSemanticUseCaseTest {

    @Mock
    private PublicationRepositoryPort publicationRepository;

    @Mock
    private StoreRepositoryPort storeRepository;

    @Mock
    private AIProviderPort aiProvider;

    private GetPublicationDetailSemanticUseCase useCase;

    private UUID publicationId;
    private UUID storeId;

    private Publication testPublication;
    private Store testStore;

    @BeforeEach
    void setUp() {

        useCase = new GetPublicationDetailSemanticUseCase(
                publicationRepository,
                storeRepository,
                aiProvider
        );

        publicationId = UUID.randomUUID();
        storeId = UUID.randomUUID();

        testStore = Store.builder()
                .id(storeId)
                .nombre("Tech Store UMSS")
                .descripcion(
                        "Tienda de equipos y accesorios tecnológicos"
                )
                .categoria("Tecnología")
                .telefonoContacto("591-123-4567")
                .emailContacto("tech@umss.edu.bo")
                .build();

        testPublication = Publication.builder()
                .id(publicationId)
                .storeId(storeId)
                .nombre("Laptop Lenovo ThinkPad")
                .descripcion(
                        "Laptop de alto rendimiento para programación"
                )
                .precio(BigDecimal.valueOf(3500.00))
                .tipo(PublicationType.PRODUCTO)
                .stock(5)
                .modalidadCobro(PaymentMode.COMPLETO)
                .activa(true)
                .createdAt(LocalDateTime.now())

                // Publication.embedding es String
                .embedding("[0.1,0.2,0.3]")

                .build();
    }

    // ============================================================
    // executeWithContext()
    // ============================================================

    @Test
    @DisplayName("Debería obtener detalles y generar contexto enriquecido")
    void debeObtenerDetallesYGenerarContexto() {

        String question =
                "¿Cuáles son las características de esta laptop?";

        String expectedResponse =
                "La Laptop Lenovo ThinkPad es una máquina potente...";

        when(publicationRepository.findById(publicationId))
                .thenReturn(Optional.of(testPublication));

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.of(testStore));

        when(aiProvider.generate(anyString()))
                .thenReturn(expectedResponse);

        String result = useCase.executeWithContext(
                publicationId,
                question
        );

        assertNotNull(result);
        assertEquals(expectedResponse, result);

        verify(publicationRepository, times(1))
                .findById(publicationId);

        verify(storeRepository, times(1))
                .findById(storeId);

        verify(aiProvider, times(1))
                .generate(
                        org.mockito.ArgumentMatchers.argThat(
                                prompt ->
                                        prompt.contains(
                                                testPublication.getNombre()
                                        )
                                        && prompt.contains(question)
                        )
                );
    }

    @Test
    @DisplayName("Debería lanzar excepción si publicación no existe")
    void debeLanzarExcepcionSiPublicacionNoExiste() {

        String question = "¿Características?";

        when(publicationRepository.findById(publicationId))
                .thenReturn(Optional.empty());

        assertThrows(
                Exception.class,
                () -> useCase.executeWithContext(
                        publicationId,
                        question
                )
        );

        verify(aiProvider, never())
                .generate(anyString());
    }

    @Test
    @DisplayName("Debería incluir información de precio en el contexto")
    void debeIncluirPrecioEnContexto() {

        String question = "¿Cuánto cuesta?";

        when(publicationRepository.findById(publicationId))
                .thenReturn(Optional.of(testPublication));

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.of(testStore));

        when(aiProvider.generate(anyString()))
                .thenReturn("Cuesta Bs. 3500");

        useCase.executeWithContext(
                publicationId,
                question
        );

        verify(aiProvider)
                .generate(
                        org.mockito.ArgumentMatchers.argThat(
                                prompt -> prompt.contains("3500")
                        )
                );
    }

    @Test
    @DisplayName("Debería incluir información de stock en el contexto")
    void debeIncluirStockEnContexto() {

        String question = "¿Cuánto stock hay?";

        when(publicationRepository.findById(publicationId))
                .thenReturn(Optional.of(testPublication));

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.of(testStore));

        when(aiProvider.generate(anyString()))
                .thenReturn("Hay 5 unidades disponibles");

        useCase.executeWithContext(
                publicationId,
                question
        );

        verify(aiProvider)
                .generate(
                        org.mockito.ArgumentMatchers.argThat(
                                prompt -> prompt.contains("5")
                        )
                );
    }

    // ============================================================
    // executeSemanticSearch()
    // ============================================================

    @Test
    @DisplayName("Debería buscar semánticamente por descripción")
    void debeBuscarSemanticamentePorDescripcion() {

        String query = "laptop para programar";

        String expectedResponse =
                "Encontré la Laptop Lenovo ThinkPad...";

        /*
         * El caso de uso primero genera el embedding
         * de la consulta.
         */
        when(aiProvider.generateEmbedding(query))
                .thenReturn(List.of(
                        0.1,
                        0.2,
                        0.3
                ));

        /*
         * Luego obtiene las publicaciones.
         */
        when(publicationRepository.findAll())
                .thenReturn(List.of(testPublication));

        /*
         * testPublication tiene:
         *
         * embedding = "[0.1,0.2,0.3]"
         *
         * Por lo tanto:
         *
         * p.getEmbedding() != null
         *
         * es verdadero.
         */
        when(storeRepository.findById(storeId))
                .thenReturn(Optional.of(testStore));

        when(aiProvider.generate(anyString()))
                .thenReturn(expectedResponse);

        String result =
                useCase.executeSemanticSearch(query);

        assertNotNull(result);

        assertEquals(
                expectedResponse,
                result
        );

        verify(aiProvider, times(1))
                .generateEmbedding(query);

        verify(publicationRepository, times(1))
                .findAll();

        verify(storeRepository, times(1))
                .findById(storeId);

        verify(aiProvider, times(1))
                .generate(anyString());
    }

    @Test
    @DisplayName("Debería devolver mensaje si no encuentra publicaciones")
    void debeDevolverMensajeSiNoHayPublicaciones() {

        String query = "xyz123abc";

        when(aiProvider.generateEmbedding(query))
                .thenReturn(List.of(
                        0.1,
                        0.2
                ));

        when(publicationRepository.findAll())
                .thenReturn(List.of());

        String result =
                useCase.executeSemanticSearch(query);

        assertNotNull(result);

        assertTrue(
                result.contains("No encontré")
                        || result.isEmpty()
        );

        verify(aiProvider, times(1))
                .generateEmbedding(query);

        verify(publicationRepository, times(1))
                .findAll();
    }

    @Test
    @DisplayName("Debería generar embedding de la consulta")
    void debeGenerarEmbeddingDeLaConsulta() {

        String query =
                "características laptop";

        List<Double> embedding = List.of(
                0.1,
                0.2,
                0.3
        );

        when(aiProvider.generateEmbedding(query))
                .thenReturn(embedding);

        /*
         * No necesitamos una publicación para este test.
         * Solo queremos comprobar que el embedding
         * de la consulta sea solicitado.
         */
        when(publicationRepository.findAll())
                .thenReturn(List.of());

        useCase.executeSemanticSearch(query);

        verify(aiProvider, times(1))
                .generateEmbedding(query);

        verify(publicationRepository, times(1))
                .findAll();
    }
}
