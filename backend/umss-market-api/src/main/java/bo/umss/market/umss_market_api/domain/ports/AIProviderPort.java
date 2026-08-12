package bo.umss.market.umss_market_api.domain.ports;

import java.util.List;

import bo.umss.market.umss_market_api.application.dto.ToolDecision;

public interface AIProviderPort {

    /**
     * Genera una respuesta libre usando el modelo de IA.
     */
    String generate(String prompt);

    /**
     * Permite al modelo decidir qué herramienta utilizar
     * y extraer los parámetros necesarios para ejecutarla.
     */
    ToolDecision selectTool(String question);

    /**
     * Genera un embedding vectorial a partir de un texto.
     *
     * Este vector será utilizado posteriormente
     * para realizar búsqueda semántica mediante RAG.
     */
    List<Double> generateEmbedding(String text);
}