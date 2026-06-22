package bo.umss.market.umss_market_api.application.usecases;

import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.PublicationDetailResponse;
import bo.umss.market.umss_market_api.domain.exceptions.PublicationNotFoundException;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetPublicationDetailUseCase {

    private final PublicationRepositoryPort publicationRepository;
    private final StoreRepositoryPort storeRepository;

    public PublicationDetailResponse execute(UUID id) {

        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new PublicationNotFoundException(
                        "Publicación no encontrada"));

        if (Boolean.FALSE.equals(publication.getActiva())) {
            throw new PublicationNotFoundException(
                    "Publicación no encontrada");
        }

        String nombreTienda = storeRepository.findById(publication.getStoreId())
                .map(Store::getNombre)
                .orElse(null);

        return PublicationDetailResponse.builder()
                .id(publication.getId())
                .nombre(publication.getNombre())
                .descripcion(publication.getDescripcion())
                .precio(publication.getPrecio())
                .tipo(publication.getTipo())
                .stock(publication.getStock())
                .modalidadCobro(publication.getModalidadCobro())
                .storeId(publication.getStoreId())
                .nombreTienda(nombreTienda)
                .activa(publication.getActiva())
                .createdAt(publication.getCreatedAt())
                .build();
    }
}
