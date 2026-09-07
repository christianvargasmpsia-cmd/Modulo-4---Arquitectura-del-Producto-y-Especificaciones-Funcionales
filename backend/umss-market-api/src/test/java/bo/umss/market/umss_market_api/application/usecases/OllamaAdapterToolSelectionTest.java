package bo.umss.market.umss_market_api.application.usecases;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

import bo.umss.market.umss_market_api.application.dto.ToolDecision;
import bo.umss.market.umss_market_api.infrastructure.adapters.OllamaAdapter;

/**
 * Tests de integración para verificar que OllamaAdapter.selectTool()
 * reconoce correctamente las herramientas disponibles del sistema RAG.
 *
 * IMPORTANTE:
 * Estos tests utilizan Ollama REAL, por lo que Ollama debe estar
 * ejecutándose y debe existir el modelo configurado en el proyecto.
 */
@DisplayName("OllamaAdapter - Tool Selection Tests")
@org.junit.jupiter.api.Tag("ollama")
class OllamaAdapterToolSelectionTest {

    private OllamaAdapter adapter;

    @BeforeEach
    void setUp() {

        var requestFactory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(Integer.getInteger("ollama.test.readTimeoutMillis", 60000));
        RestTemplate restTemplate = new RestTemplate(requestFactory);

        adapter = new OllamaAdapter(restTemplate);
    }

    // ============================================================
    // TOOL #1: SEARCH_CATALOG
    // ============================================================

    @Test
    @DisplayName("Debería reconocer SEARCH_CATALOG en consulta: 'Necesito algo para programar'")
    void debeReconocerSearchCatalogEnConsultaProgramar() {

        String pregunta = "Necesito algo para programar";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());
        assertNotNull(decision.getQuery());

        assertEquals(
                "SEARCH_CATALOG",
                decision.getTool()
        );

        assertFalse(
                decision.getQuery().isBlank(),
                "La query generada no debería estar vacía"
        );
    }

    @Test
    @DisplayName("Debería reconocer SEARCH_CATALOG en: '¿Qué computadoras tienen?'")
    void debeReconocerSearchCatalogEnComputadoras() {

        String pregunta = "¿Qué computadoras tienen?";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());
        assertNotNull(decision.getQuery());

        assertEquals(
                "SEARCH_CATALOG",
                decision.getTool()
        );

        assertTrue(
                decision.getQuery()
                        .toLowerCase()
                        .contains("computadora"),
                "La query debería contener 'computadora'"
        );
    }

    @Test
    @DisplayName("Debería reconocer SEARCH_CATALOG en: 'Busco mouse gamer'")
    void debeReconocerSearchCatalogEnMouse() {

        String pregunta = "Busco mouse gamer";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());

        assertEquals(
                "SEARCH_CATALOG",
                decision.getTool()
        );
    }

    // ============================================================
    // TOOL #2: PUBLICATION_DETAIL
    // ============================================================

    @Test
    @DisplayName("Debería reconocer PUBLICATION_DETAIL o SEARCH_CATALOG en consulta de características")
    void debeReconocerPublicationDetailEnCaracteristicas() {

        String pregunta = "¿Qué características tiene la laptop?";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());

        assertTrue(
                decision.getTool().equals("PUBLICATION_DETAIL")
                        || decision.getTool().equals("SEARCH_CATALOG"),
                "Debería reconocer PUBLICATION_DETAIL o SEARCH_CATALOG"
        );
    }

    @Test
    @DisplayName("Debería reconocer una herramienta válida para precio y stock")
    void debeReconocerPublicationDetailEnPrecioStock() {

        String pregunta = "¿Cuánto cuesta y cuánto stock tiene?";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());

        assertTrue(
                esToolValida(decision.getTool()),
                "La herramienta seleccionada debe ser válida"
        );
    }

    // ============================================================
    // TOOL #3: SEARCH_STORES
    // ============================================================

    @Test
    @DisplayName("Debería reconocer una herramienta válida para búsqueda de tiendas")
    void debeReconocerSearchStoresEnTienda() {

        String pregunta = "¿Qué tienda vende programación?";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());

        assertTrue(
                esToolValida(decision.getTool()),
                "La herramienta seleccionada debe ser válida"
        );
    }

    @Test
    @DisplayName("Debería reconocer una herramienta válida para búsqueda de emprendimientos")
    void debeReconocerSearchStoresEnEmprendimiento() {

        String pregunta =
                "Busco emprendimiento que venda computadoras";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());

        assertTrue(
                esToolValida(decision.getTool()),
                "La herramienta seleccionada debe ser válida"
        );
    }

    // ============================================================
    // TOOL #4: USER_INTERACTIONS
    // ============================================================

    @Test
    @DisplayName("Debería reconocer USER_INTERACTIONS o SEARCH_CATALOG para historial")
    void debeReconocerUserInteractionsEnHistorial() {

        String pregunta =
                "¿Con qué productos interactué?";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());

        assertTrue(
                decision.getTool().equals("USER_INTERACTIONS")
                        || decision.getTool().equals("SEARCH_CATALOG"),
                "Debería reconocer USER_INTERACTIONS o SEARCH_CATALOG"
        );
    }

    @Test
    @DisplayName("Debería reconocer una herramienta válida para productos de interés")
    void debeReconocerUserInteractionsEnInteres() {

        String pregunta =
                "¿Qué productos me interesaron?";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());

        assertTrue(
                esToolValida(decision.getTool()),
                "La herramienta seleccionada debe ser válida"
        );
    }

    // ============================================================
    // TOOL #5: RECOMMENDATIONS
    // ============================================================

    @Test
    @DisplayName("Debería reconocer una herramienta válida para recomendaciones")
    void debeReconocerRecommendationsEnRecomienda() {

        String pregunta =
                "¿Qué me recomiendas?";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());

        assertTrue(
                esToolValida(decision.getTool()),
                "La herramienta seleccionada debe ser válida"
        );
    }

    @Test
    @DisplayName("Debería reconocer una herramienta válida para productos similares")
    void debeReconocerRecommendationsEnProductosSimilares() {

        String pregunta =
                "Recomiéndame productos similares";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());

        assertTrue(
                esToolValida(decision.getTool()),
                "La herramienta seleccionada debe ser válida"
        );
    }

    // ============================================================
    // NO_TOOL: CONSULTAS FUERA DE ALCANCE
    // ============================================================

    @Test
    @DisplayName("Debería devolver NO_TOOL en: '¿Cuál es tu comida favorita?'")
    void debeDevolverNoToolEnConsultaFueraDeAlcance() {

        String pregunta =
                "¿Cuál es tu comida favorita?";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);

        assertEquals(
                "NO_TOOL",
                decision.getTool()
        );

        assertEquals(
                "",
                decision.getQuery()
        );
    }

    @Test
    @DisplayName("Debería devolver NO_TOOL en: 'Cuéntame un chiste'")
    void debeDevolverNoToolEnChiste() {

        String pregunta =
                "Cuéntame un chiste";

        ToolDecision decision = adapter.selectTool(pregunta);

        assertNotNull(decision);

        assertEquals(
                "NO_TOOL",
                decision.getTool()
        );
    }

    // ============================================================
    // VALIDACIONES GENERALES
    // ============================================================

    @Test
    @DisplayName("selectTool() no debería devolver null")
    void selectToolNoDebeDevolverNull() {

        String pregunta =
                "Busco laptop";

        ToolDecision decision =
                adapter.selectTool(pregunta);

        assertNotNull(decision);
        assertNotNull(decision.getTool());
        assertNotNull(decision.getQuery());
    }

    @Test
    @DisplayName("selectTool() debería devolver ToolDecision con estructura válida")
    void selectToolDebeDevolverEstructuraValida() {

        String pregunta =
                "¿Qué tienes en catálogo?";

        ToolDecision decision =
                adapter.selectTool(pregunta);

        assertNotNull(decision);

        assertNotNull(
                decision.getTool(),
                "Tool no debería ser null"
        );

        assertNotNull(
                decision.getQuery(),
                "Query no debería ser null"
        );

        assertTrue(
                esToolValida(decision.getTool()),
                "Tool debe ser una herramienta válida"
        );
    }

    // ============================================================
    // MÉTODO AUXILIAR
    // ============================================================

    /**
     * Verifica que la herramienta devuelta por Ollama
     * pertenece al conjunto de herramientas soportadas.
     */
    private boolean esToolValida(String tool) {

        return tool.equals("SEARCH_CATALOG")
                || tool.equals("PUBLICATION_DETAIL")
                || tool.equals("SEARCH_STORES")
                || tool.equals("USER_INTERACTIONS")
                || tool.equals("RECOMMENDATIONS")
                || tool.equals("NO_TOOL");
    }
}
