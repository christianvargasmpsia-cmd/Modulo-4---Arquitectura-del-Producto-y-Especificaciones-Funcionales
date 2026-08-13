package bo.umss.market.umss_market_api.application.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.Collections;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;


import bo.umss.market.umss_market_api.application.dto.CatalogFilterRequest;
import bo.umss.market.umss_market_api.application.dto.ToolDecision;
import bo.umss.market.umss_market_api.application.usecases.SearchCatalogUseCase;
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
        aiService = new AIServiceImpl(aiProvider, searchCatalogUseCase);
    }

    @Test
    @DisplayName("chat() debería identificar SEARCH_CATALOG")
    void chatDebeIdentificarSearchCatalog() {
        // ARRANGE
        String message = "Busco laptop";
        ToolDecision decision = new ToolDecision();
        decision.setTool("SEARCH_CATALOG");
        decision.setQuery("laptop");

        when(aiProvider.selectTool(message)).thenReturn(decision);
        // Stub para evitar NullPointerException si AIServiceImpl delega la ejecución al caso de uso
        lenient().when(searchCatalogUseCase.execute(any(CatalogFilterRequest.class))).thenReturn(Collections.emptyList());

        // ACT
        String result = aiService.chat(message);

        // ASSERT
        assertNotNull(result);
        verify(aiProvider).selectTool(message);
    }

    @Test
    @DisplayName("chat() debería retornar NO_TOOL para consultas fuera de alcance")
    void chatDebeRetornarNoToolParaConsultasFueraDeAlcance() {
        // ARRANGE
        String message = "¿Cuál es tu comida favorita?";
        ToolDecision decision = new ToolDecision();
        decision.setTool("NO_TOOL");
        decision.setQuery("");

        when(aiProvider.selectTool(message)).thenReturn(decision);

        // ACT
        String result = aiService.chat(message);

        // ASSERT
        assertNotNull(result);
        assertFalse(result.isBlank(), "El resultado no debería estar vacío");
    }

    @Test
    @DisplayName("chat() no debería devolver null")
    void chatNoDebeDevlverNull() {
        // ARRANGE
        String message = "cualquier mensaje";
        ToolDecision decision = new ToolDecision();
        decision.setTool("NO_TOOL"); // Se especifica la herramienta para evitar saltos de lógica internos

        when(aiProvider.selectTool(message)).thenReturn(decision);

        // ACT
        String result = aiService.chat(message);

        // ASSERT
        assertNotNull(result);
    }

    @Test
    @DisplayName("chat() debería manejar mensaje vacío")
    void chatDebeManejarMensajeVacio() {
        // ACT
        String result = aiService.chat("");

        // ASSERT
        assertNotNull(result);
        assertFalse(result.isBlank());
    }
}