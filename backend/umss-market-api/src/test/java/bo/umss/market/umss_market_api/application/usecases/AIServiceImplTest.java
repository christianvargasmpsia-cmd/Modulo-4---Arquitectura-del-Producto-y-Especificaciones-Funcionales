package bo.umss.market.umss_market_api.application.usecases;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.Collections;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.test.util.ReflectionTestUtils;

import bo.umss.market.umss_market_api.application.dto.ToolDecision;
import bo.umss.market.umss_market_api.application.services.AIServiceImpl;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;

@ExtendWith(MockitoExtension.class)
@DisplayName("AIServiceImpl - Router de Herramientas (RAGs 1-5)")
class AIServiceImplTest {

    @Mock
    private AIProviderPort aiProvider;

    @Mock
    private SearchCatalogUseCase searchCatalogUseCase;

    private AIServiceImpl aiService;

    @BeforeEach
    void setUp() {

        aiService = new AIServiceImpl(
                aiProvider,
                searchCatalogUseCase
        );

        /*
         * AIServiceImpl obtiene iaEnabled mediante @Value.
         *
         * Como este es un Unit Test y no levantamos
         * el contexto completo de Spring, activamos
         * manualmente la IA.
         */
        ReflectionTestUtils.setField(
                aiService,
                "iaEnabled",
                true
        );
    }

    // ============================================================
    // TEST 1 - SEARCH_CATALOG
    // ============================================================

    @Test
    @DisplayName("chat() debería identificar SEARCH_CATALOG")
    void chatDebeIdentificarSearchCatalog() {

        // ARRANGE

        String message = "Busco laptop";

        ToolDecision decision = new ToolDecision();

        decision.setTool("SEARCH_CATALOG");
        decision.setQuery("laptop");

        when(aiProvider.selectTool(message))
                .thenReturn(decision);

        /*
         * Cuando la herramienta seleccionada es SEARCH_CATALOG,
         * AIServiceImpl utiliza:
         *
         * searchCatalogUseCase.executeSemanticSearch(message, 5)
         */
        when(searchCatalogUseCase.executeSemanticSearch(
                message,
                5
        )).thenReturn(Collections.emptyList());

        // ACT

        String result = aiService.chat(message);

        // ASSERT

        assertNotNull(result);

        verify(aiProvider)
                .selectTool(message);

        verify(searchCatalogUseCase)
                .executeSemanticSearch(
                        message,
                        5
                );
    }

    // ============================================================
    // TEST 2 - NO_TOOL
    // ============================================================

    @Test
    @DisplayName("chat() debería retornar NO_TOOL para consultas fuera de alcance")
    void chatDebeRetornarNoToolParaConsultasFueraDeAlcance() {

        // ARRANGE

        String message = "¿Cuál es tu comida favorita?";

        ToolDecision decision = new ToolDecision();

        decision.setTool("NO_TOOL");
        decision.setQuery("");

        when(aiProvider.selectTool(message))
                .thenReturn(decision);

        // ACT

        String result = aiService.chat(message);

        // ASSERT

        assertNotNull(result);

        assertFalse(
                result.isBlank(),
                "El resultado no debería estar vacío"
        );

        verify(aiProvider)
                .selectTool(message);

        /*
         * NO_TOOL no debe ejecutar una búsqueda.
         */
        verifyNoInteractions(searchCatalogUseCase);
    }

    // ============================================================
    // TEST 3 - RESULTADO NO NULL
    // ============================================================

    @Test
    @DisplayName("chat() no debería devolver null")
    void chatNoDebeDevolverNull() {

        // ARRANGE

        String message = "cualquier mensaje";

        ToolDecision decision = new ToolDecision();

        decision.setTool("NO_TOOL");
        decision.setQuery("");

        when(aiProvider.selectTool(message))
                .thenReturn(decision);

        // ACT

        String result = aiService.chat(message);

        // ASSERT

        assertNotNull(result);

        verify(aiProvider)
                .selectTool(message);

        verifyNoInteractions(searchCatalogUseCase);
    }

    // ============================================================
    // TEST 4 - MENSAJE VACÍO
    // ============================================================

    @Test
    @DisplayName("chat() debería manejar mensaje vacío")
    void chatDebeManejarMensajeVacio() {

        // ACT

        String result = aiService.chat("");

        // ASSERT

        assertNotNull(result);

        assertFalse(
                result.isBlank(),
                "El resultado no debería estar vacío"
        );

        /*
         * Para un mensaje vacío AIServiceImpl retorna
         * inmediatamente y no consulta al proveedor.
         */
        verifyNoInteractions(aiProvider);

        verifyNoInteractions(searchCatalogUseCase);
    }
}