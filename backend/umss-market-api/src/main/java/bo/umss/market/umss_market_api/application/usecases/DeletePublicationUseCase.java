package bo.umss.market.umss_market_api.application.usecases;

import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeletePublicationUseCase {

    private final PublicationRepositoryPort publicationRepository;

    public void execute(UUID id) {

        publicationRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Publicación no encontrada"));

        publicationRepository.deleteById(id);
    }
}