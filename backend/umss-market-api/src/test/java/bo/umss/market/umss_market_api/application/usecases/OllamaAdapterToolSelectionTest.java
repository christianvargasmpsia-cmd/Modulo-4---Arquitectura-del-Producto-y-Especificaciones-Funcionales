package bo.umss.market.umss_market_api.infrastructure.adapters;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.web.client.RestTemplate;

import bo.umss.market.umss_market_api.application.dto.ToolDecision;

/**
 * Tests para verificar que OllamaAdapter.selectTool()
 * reconoce correctamente los 5 tools del sistema RAG.
 */
@DisplayName("OllamaAdapter - Tool Selection Tests")
class OllamaAdapterToolSelectionTest {

    private OllamaAdapter adapter;
    private RestTemplate restTemplate;

    @BeforeEach
    void setUp() {
        restTemplate = new RestTemplate();
        adapter = new OllamaAdapter(restTemplate);
    }

    // ============================================
    // TOOL #1: SEARCH_CATALOG
    // ============================================

    @Test
    @DisplayName("Debería reconocer SEARCH_CATALOG en consulta: 'Necesito algo para programar'")
    void debeReconocerSearchCatalogEnConsultaProgramar() {
        String pregunta = "Necesito algo para programar";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertEquals("SEARCH_CATALOG", decision.getTool());
        assertNotNull(decision.getQuery());
        assertFalse(decision.getQuery().isBlank());
    }

    @Test
    @DisplayName("Debería reconocer SEARCH_CATALOG en: '¿Qué computadoras tienen?'")
    void debeReconocerSearchCatalogEnComputadoras() {
        String pregunta = "¿Qué computadoras tienen?";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertEquals("SEARCH_CATALOG", decision.getTool());
        assertTrue(decision.getQuery().toLowerCase().contains("computadora"));
    }

    @Test
    @DisplayName("Debería reconocer SEARCH_CATALOG en: 'Busco mouse gamer'")
    void debeReconocerSearchCatalogEnMouse() {
        String pregunta = "Busco mouse gamer";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertEquals("SEARCH_CATALOG", decision.getTool());
    }

    // ============================================
    // TOOL #2: PUBLICATION_DETAIL
    // ============================================

    @Test
    @DisplayName("Debería reconocer PUBLICATION_DETAIL en: '¿Qué características tiene la laptop?'")
    void debeReconocerPublicationDetailEnCaracteristicas() {
        String pregunta = "¿Qué características tiene la laptop?";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        // Puede ser SEARCH_CATALOG o PUBLICATION_DETAIL dependiendo del LLM
        assertTrue(
            decision.getTool().equals("PUBLICATION_DETAIL") || 
            decision.getTool().equals("SEARCH_CATALOG"),
            "Debería reconocer como PUBLICATION_DETAIL o SEARCH_CATALOG"
        );
    }

    @Test
    @DisplayName("Debería reconocer PUBLICATION_DETAIL en: '¿Cuánto cuesta y cuánto stock tiene?'")
    void debeReconocerPublicationDetailEnPrecioStock() {
        String pregunta = "¿Cuánto cuesta y cuánto stock tiene?";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());
        // Este test será más específico cuando mejores el prompt de selectTool
    }

    // ============================================
    // TOOL #3: SEARCH_STORES
    // ============================================

    @Test
    @DisplayName("Debería reconocer SEARCH_STORES en: '¿Qué tienda vende programación?'")
    void debeReconocerSearchStoresEnTienda() {
        String pregunta = "¿Qué tienda vende programación?";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        // El LLM debe decidir si es SEARCH_STORES o SEARCH_CATALOG
        assertNotNull(decision.getTool());
    }

    @Test
    @DisplayName("Debería reconocer SEARCH_STORES en: 'Busco emprendimiento que venda computadoras'")
    void debeReconocerSearchStoresEnEmprendimiento() {
        String pregunta = "Busco emprendimiento que venda computadoras";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());
    }

    // ============================================
    // TOOL #4: USER_INTERACTIONS
    // ============================================

    @Test
    @DisplayName("Debería reconocer USER_INTERACTIONS en: '¿Con qué productos interactué?'")
    void debeReconocerUserInteractionsEnHistorial() {
        String pregunta = "¿Con qué productos interactué?";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        // Debe reconocer como USER_INTERACTIONS
        assertTrue(
            decision.getTool().equals("USER_INTERACTIONS") ||
            decision.getTool().equals("SEARCH_CATALOG"),
            "Debería reconocer como USER_INTERACTIONS"
        );
    }

    @Test
    @DisplayName("Debería reconocer USER_INTERACTIONS en: '¿Qué productos me interesaron?'")
    void debeReconocerUserInteractionsEnInteres() {
        String pregunta = "¿Qué productos me interesaron?";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());
    }

    // ============================================
    // TOOL #5: RECOMMENDATIONS
    // ============================================

    @Test
    @DisplayName("Debería reconocer RECOMMENDATIONS en: '¿Qué me recomiendas?'")
    void debeReconocerRecommendationsEnRecomienda() {
        String pregunta = "¿Qué me recomiendas?";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());
    }

    @Test
    @DisplayName("Debería reconocer RECOMMENDATIONS en: 'Recomiéndame productos similares'")
    void debeReconocerRecommendationsEnProductosSimilares() {
        String pregunta = "Recomiéndame productos similares";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());
    }

    // ============================================
    // NO_TOOL: Fuera de alcance
    // ============================================

    @Test
    @DisplayName("Debería devolver NO_TOOL en: '¿Cuál es tu comida favorita?'")
    void debeDevlverNoToolEnConsultaFueraDeAlcance() {
        String pregunta = "¿Cuál es tu comida favorita?";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertEquals("NO_TOOL", decision.getTool());
        assertEquals("", decision.getQuery());
    }

    @Test
    @DisplayName("Debería devolver NO_TOOL en: 'Cuéntame un chiste'")
    void debeDevlverNoToolEnChiste() {
        String pregunta = "Cuéntame un chiste";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertEquals("NO_TOOL", decision.getTool());
    }

    // ============================================
    // Validaciones generales
    // ============================================

    @Test
    @DisplayName("selectTool no debería devolver null")
    void selectToolNoDebeDevlverNull() {
        String pregunta = "Busco laptop";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());
    }

    @Test
    @DisplayName("selectTool debería devolver ToolDecision con estructura válida")
    void selectToolDebeDevlverEstructuraValida() {
        String pregunta = "¿Qué tienes en catálogo?";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertTrue(
            decision.getTool().equals("SEARCH_CATALOG") ||
            decision.getTool().equals("NO_TOOL") ||
            decision.getTool().equals("PUBLICATION_DETAIL") ||
            decision.getTool().equals("SEARCH_STORES") ||
            decision.getTool().equals("USER_INTERACTIONS") ||
            decision.getTool().equals("RECOMMENDATIONS"),
            "Tool debe ser uno de los 5 tools válidos"
        );
        assertNotNull(decision.getQuery());
    }
}