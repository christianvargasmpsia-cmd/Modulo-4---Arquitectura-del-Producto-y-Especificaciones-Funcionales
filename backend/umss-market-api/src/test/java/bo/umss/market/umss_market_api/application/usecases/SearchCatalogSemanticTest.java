package bo.umss.market.umss_market_api.application.usecases;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

import bo.umss.market.umss_market_api.application.dto.PublicationSummaryResponse;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;
import bo.umss.market.umss_market_api.infrastructure.adapters.OllamaAdapter;

@org.junit.jupiter.api.Tag("ollama")
class SearchCatalogSemanticTest {

    @Test
    void debeRealizarRetrievalSemantico() {

        // =====================================================
        // ARRANGE
        // =====================================================

        var requestFactory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(5000);
        requestFactory.setReadTimeout(Integer.getInteger("ollama.test.readTimeoutMillis", 60000));
        AIProviderPort aiProvider =
                new OllamaAdapter(new RestTemplate(requestFactory));

        PublicationRepositoryPort publicationRepository =
                mock(PublicationRepositoryPort.class);

        StoreRepositoryPort storeRepository =
                mock(StoreRepositoryPort.class);

        UUID storeId = UUID.randomUUID();

        Publication laptop =
                Publication.builder()
                        .id(UUID.randomUUID())
                        .storeId(storeId)
                        .nombre("Laptop Lenovo ThinkPad")
                        .descripcion(
                                "Computadora portátil con procesador "
                                        + "Intel Core i7, 16GB de RAM y "
                                        + "SSD de 512GB. Ideal para "
                                        + "programación y desarrollo de software."
                        )
                        .activa(true)
                        .build();

        Publication mochila =
                Publication.builder()
                        .id(UUID.randomUUID())
                        .storeId(storeId)
                        .nombre("Mochila universitaria")
                        .descripcion(
                                "Mochila resistente para estudiantes "
                                        + "universitarios."
                        )
                        .activa(true)
                        .build();

        Publication bicicleta =
                Publication.builder()
                        .id(UUID.randomUUID())
                        .storeId(storeId)
                        .nombre("Bicicleta urbana")
                        .descripcion(
                                "Bicicleta para transporte y movilidad "
                                        + "dentro de la ciudad."
                        )
                        .activa(true)
                        .build();

        when(publicationRepository.findAll())
                .thenReturn(
                        List.of(
                                laptop,
                                mochila,
                                bicicleta
                        )
                );

        when(storeRepository.findById(storeId))
                .thenReturn(Optional.empty());

        SearchCatalogUseCase useCase =
                new SearchCatalogUseCase(
                        publicationRepository,
                        storeRepository,
                        aiProvider
                );

        // =====================================================
        // ACT
        // =====================================================

        String pregunta =
                "Necesito algo para programar";

        List<PublicationSummaryResponse> resultados =
                useCase.executeSemanticSearch(
                        pregunta,
                        3
                );

        // =====================================================
        // ASSERT
        // =====================================================

        assertNotNull(resultados);

        assertFalse(
                resultados.isEmpty(),
                "El Retrieval debería devolver resultados"
        );

        // =====================================================
        // EVIDENCIA
        // =====================================================

        System.out.println();
        System.out.println("==============================================");
        System.out.println("       RETRIEVAL SEMÁNTICO UMSS MARKET");
        System.out.println("==============================================");

        System.out.println();
        System.out.println("Pregunta:");
        System.out.println(pregunta);

        System.out.println();
        System.out.println("Resultados recuperados:");
        System.out.println("----------------------------------------------");

        for (int i = 0; i < resultados.size(); i++) {

            PublicationSummaryResponse resultado =
                    resultados.get(i);

            System.out.println(
                    (i + 1)
                            + ". "
                            + resultado.getNombre()
            );

            System.out.println(
                    "   "
                            + resultado.getDescripcion()
            );

            System.out.println();
        }

        System.out.println("==============================================");
        System.out.println();
    }
}
