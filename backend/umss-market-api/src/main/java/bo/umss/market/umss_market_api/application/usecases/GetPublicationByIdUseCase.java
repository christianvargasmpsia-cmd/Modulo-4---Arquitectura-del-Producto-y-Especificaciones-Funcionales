package bo.umss.market.umss_market_api.application.usecases;

import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetPublicationByIdUseCase {

    private final PublicationRepositoryPort publicationRepository;

    public Publication execute(UUID id) {

        return publicationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Publicación no encontrada"));
    }
}