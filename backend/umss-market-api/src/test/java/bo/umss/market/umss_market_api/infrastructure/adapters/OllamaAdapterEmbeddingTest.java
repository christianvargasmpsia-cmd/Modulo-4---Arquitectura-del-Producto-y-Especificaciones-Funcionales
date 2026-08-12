package bo.umss.market.umss_market_api.infrastructure.adapters;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

class OllamaAdapterEmbeddingTest {

    @Test
    void debeGenerarEmbeddingDesdeOllama() {

        // Arrange
        OllamaAdapter adapter =
                new OllamaAdapter(new RestTemplate());

        String texto =
                "Laptop para programación con buena memoria";

        // Act
        List<Double> embedding =
                adapter.generateEmbedding(texto);

        // Assert
        assertNotNull(embedding);
        assertFalse(embedding.isEmpty());

        System.out.println("======================================");
        System.out.println("PRUEBA DE EMBEDDING");
        System.out.println("======================================");
        System.out.println("Texto:");
        System.out.println(texto);
        System.out.println("--------------------------------------");
        System.out.println("Cantidad de dimensiones:");
        System.out.println(embedding.size());
        System.out.println("--------------------------------------");
        System.out.println("Primeros valores:");

        embedding.stream()
                .limit(10)
                .forEach(value ->
                        System.out.println(value)
                );

        System.out.println("======================================");
    }
}