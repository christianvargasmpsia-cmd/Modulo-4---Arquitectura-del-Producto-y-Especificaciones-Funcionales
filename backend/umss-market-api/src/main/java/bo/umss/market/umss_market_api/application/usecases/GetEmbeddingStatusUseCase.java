package bo.umss.market.umss_market_api.application.usecases;

import java.util.List;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetEmbeddingStatusUseCase {

    private final PublicationRepositoryPort publicationRepository;

    public EmbeddingStatus execute() {

        List<Publication> publications =
                publicationRepository.findAll();

        int total = publications.size();

        int withEmbeddings = (int) publications.stream()
                .filter(publication ->
                        publication.getEmbedding() != null &&
                        !publication.getEmbedding().isBlank())
                .count();

        int withoutEmbeddings =
                total - withEmbeddings;

        return new EmbeddingStatus(
                total,
                withEmbeddings,
                withoutEmbeddings
        );
    }

    public record EmbeddingStatus(
            int totalPublications,
            int withEmbeddings,
            int withoutEmbeddings
    ) {
    }
}