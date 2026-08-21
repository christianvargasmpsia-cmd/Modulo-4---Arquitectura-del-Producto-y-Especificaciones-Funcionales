package bo.umss.market.umss_market_api.application.usecases;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.UpdatePublicationRequest;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UpdatePublicationUseCase {

    private final PublicationRepositoryPort publicationRepository;

    public Publication execute(
            UUID id,
            UpdatePublicationRequest request) {

        Publication publication =
                publicationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Publicación no encontrada"));

        if (request.getNombre() != null) {
            publication.setNombre(
                    request.getNombre());
        }

        if (request.getDescripcion() != null) {
            publication.setDescripcion(
                    request.getDescripcion());
        }

        if (request.getPrecio() != null) {
            publication.setPrecio(
                    request.getPrecio());
        }

        if (request.getTipo() != null) {
            publication.setTipo(
                    request.getTipo());
        }

        if (request.getStock() != null) {
            publication.setStock(
                    request.getStock());
        }

        if (request.getModalidadCobro() != null) {
            publication.setModalidadCobro(
                    request.getModalidadCobro());
        }

        publication.setUpdatedAt(
                LocalDateTime.now());

        return publicationRepository.save(
                publication);
    }
}