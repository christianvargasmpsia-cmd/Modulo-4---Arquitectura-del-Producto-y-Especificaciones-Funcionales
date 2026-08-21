package bo.umss.market.umss_market_api.application.usecases;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReindexPublicationEmbeddingsUseCase {

    private final PublicationRepositoryPort publicationRepository;
    private final AIProviderPort aiProvider;
    private final ObjectMapper objectMapper;

    public ReindexResult execute() {

        List<Publication> publications =
                publicationRepository.findAll();

        int total = publications.size();
        int processed = 0;
        int errors = 0;

        for (Publication publication : publications) {

            try {

                String textoEmbedding = String.format("""
                        Producto: %s
                        Descripción: %s
                        Precio: %s
                        Tipo: %s
                        Modalidad de cobro: %s
                        Stock: %s
                        """,
                        publication.getNombre(),
                        publication.getDescripcion(),
                        publication.getPrecio(),
                        publication.getTipo(),
                        publication.getModalidadCobro(),
                        publication.getStock()
                );

                List<Double> embedding =
                        aiProvider.generateEmbedding(textoEmbedding);

                if (embedding == null || embedding.isEmpty()) {
                    errors++;
                    continue;
                }

                String embeddingJson =
                        objectMapper.writeValueAsString(embedding);

                publication.setEmbedding(embeddingJson);

                publicationRepository.save(publication);

                processed++;

            } catch (JsonProcessingException e) {

                errors++;

            } catch (Exception e) {

                errors++;
            }
        }

        return new ReindexResult(
                total,
                processed,
                errors
        );
    }

    public record ReindexResult(
            int total,
            int processed,
            int errors
    ) {
    }
}