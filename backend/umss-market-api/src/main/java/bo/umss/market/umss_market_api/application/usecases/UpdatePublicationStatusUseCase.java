package bo.umss.market.umss_market_api.application.usecases;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.UpdatePublicationStatusRequest;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UpdatePublicationStatusUseCase {

    private final PublicationRepositoryPort publicationRepository;

    public Publication execute(
            UUID id,
            UpdatePublicationStatusRequest request) {

        Publication publication =
                publicationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Publicación no encontrada"));

        if (request.getActiva() == null) {
            throw new RuntimeException(
                    "El estado activa es obligatorio");
        }

        publication.setActiva(
                request.getActiva());

        publication.setUpdatedAt(
                LocalDateTime.now());

        return publicationRepository.save(
                publication);
    }
}