package bo.umss.market.umss_market_api.application.usecases;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
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

        // Preparar datos de prueba
        publicationId = UUID.randomUUID();
        storeId = UUID.randomUUID();

        testStore = Store.builder()
                .id(storeId)
                .nombre("Tech Store UMSS")
                .descripcion("Tienda de equipos y accesorios tecnológicos")
                .categoria("Tecnología")
                .telefonoContacto("591-123-4567")
                .emailContacto("tech@umss.edu.bo")
                .build();

        testPublication = Publication.builder()
                .id(publicationId)
                .storeId(storeId)
                .nombre("Laptop Lenovo ThinkPad")
                .descripcion("Laptop de alto rendimiento para programación")
                .precio(BigDecimal.valueOf(3500.00))
                .tipo(PublicationType.PRODUCTO)
                .stock(5)
                .modalidadCobro(PaymentMode.COMPLETO)
                .activa(true)
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ============================================
    // CASOS DE USO: executeWithContext()
    // ============================================

    @Test
    @DisplayName("Debería obtener detalles y generar contexto enriquecido")
    void debeObtenerDetallesYGenerarContexto() {
        // ARRANGE
        String question = "¿Cuáles son las características de esta laptop?";
        String expectedResponse = "La Laptop Lenovo ThinkPad es una máquina potente...";

        when(publicationRepository.findById(publicationId))
                .thenReturn(Optional.of(testPublication));
        when(storeRepository.findById(storeId))
                .thenReturn(Optional.of(testStore));
        when(aiProvider.generate(anyString()))
                .thenReturn(expectedResponse);

        // ACT
        String result = useCase.executeWithContext(publicationId, question);

        // ASSERT
        assertNotNull(result);
        assertEquals(expectedResponse, result);

        // Verificar que se llamaron los repositorios correctamente
        verify(publicationRepository, times(1)).findById(publicationId);
        verify(storeRepository, times(1)).findById(storeId);
        verify(aiProvider, times(1)).generate(argThat(prompt ->
                prompt.contains(testPublication.getNombre()) &&
                prompt.contains(question)
        ));
    }

    @Test
    @DisplayName("Debería lanzar excepción si publicación no existe")
    void debeeLanzarExcepcionSiPublicacionNoExiste() {
        // ARRANGE
        String question = "¿Características?";

        when(publicationRepository.findById(publicationId))
                .thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThrows(Exception.class, () ->
                useCase.executeWithContext(publicationId, question)
        );

        verify(aiProvider, never()).generate(anyString());
    }

    @Test
    @DisplayName("Debería incluir información de precio en el contexto")
    void debeIncluirPrecioEnContexto() {
        // ARRANGE
        String question = "¿Cuánto cuesta?";

        when(publicationRepository.findById(publicationId))
                .thenReturn(Optional.of(testPublication));
        when(storeRepository.findById(storeId))
                .thenReturn(Optional.of(testStore));
        when(aiProvider.generate(anyString()))
                .thenReturn("Cuesta Bs. 3500");

        // ACT
        useCase.executeWithContext(publicationId, question);

        // ASSERT
        verify(aiProvider).generate(argThat(prompt ->
                prompt.contains("3500")
        ));
    }

    @Test
    @DisplayName("Debería incluir información de stock en el contexto")
    void debeIncluirStockEnContexto() {
        // ARRANGE
        String question = "¿Cuánto stock hay?";

        when(publicationRepository.findById(publicationId))
                .thenReturn(Optional.of(testPublication));
        when(storeRepository.findById(storeId))
                .thenReturn(Optional.of(testStore));
        when(aiProvider.generate(anyString()))
                .thenReturn("Hay 5 unidades disponibles");

        // ACT
        useCase.executeWithContext(publicationId, question);

        // ASSERT
        verify(aiProvider).generate(argThat(prompt ->
                prompt.contains("5")
        ));
    }

    // ============================================
    // CASOS DE USO: executeSemanticSearch()
    // ============================================

    @Test
    @DisplayName("Debería buscar semánticamente por descripción")
    void debeBuscarSemanticamentePorDescripcion() {
        // ARRANGE
        String query = "laptop para programar";
        String expectedResponse = "Encontré la Laptop Lenovo ThinkPad...";

        when(publicationRepository.findAll())
                .thenReturn(java.util.List.of(testPublication));
        when(aiProvider.generateEmbedding(query))
                .thenReturn(java.util.List.of(0.1, 0.2, 0.3)); // Embedding simulado
        when(storeRepository.findById(storeId))
                .thenReturn(Optional.of(testStore));
        when(aiProvider.generate(anyString()))
                .thenReturn(expectedResponse);

        // ACT
        String result = useCase.executeSemanticSearch(query);

        // ASSERT
        assertNotNull(result);
        assertEquals(expectedResponse, result);
        verify(aiProvider, times(1)).generateEmbedding(query);
    }

    @Test
    @DisplayName("Debería devolver mensaje si no encuentra publicaciones")
    void debeDevlverMensajeSiNoHayPublicaciones() {
        // ARRANGE
        String query = "xyz123abc";

        when(publicationRepository.findAll())
                .thenReturn(java.util.List.of());
        when(aiProvider.generateEmbedding(query))
                .thenReturn(java.util.List.of(0.1, 0.2));

        // ACT
        String result = useCase.executeSemanticSearch(query);

        // ASSERT
        assertNotNull(result);
        assertTrue(result.contains("No encontré") || result.isEmpty());
    }

    @Test
    @DisplayName("Debería generar embedding de la consulta")
    void debeGenerarEmbeddingDeLaConsulta() {
        // ARRANGE
        String query = "características laptop";

        when(publicationRepository.findAll())
                .thenReturn(java.util.List.of(testPublication));
        when(aiProvider.generateEmbedding(query))
                .thenReturn(java.util.List.of(0.1, 0.2, 0.3));
        when(storeRepository.findById(storeId))
                .thenReturn(Optional.of(testStore));
        when(aiProvider.generate(anyString()))
                .thenReturn("Respuesta");

        // ACT
        useCase.executeSemanticSearch(query);

        // ASSERT
        verify(aiProvider).generateEmbedding(query);
    }
}