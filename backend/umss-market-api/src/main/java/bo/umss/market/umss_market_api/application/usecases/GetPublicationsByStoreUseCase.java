package bo.umss.market.umss_market_api.application.usecases;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.PublicationSummaryResponse;
import bo.umss.market.umss_market_api.domain.model.CatalogFilter;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetPublicationsByStoreUseCase {

    private final PublicationRepositoryPort publicationRepository;

    /**
     * Obtiene todas las publicaciones de una tienda.
     *
     * Se utiliza el mismo mecanismo de filtros
     * que utiliza SearchCatalogUseCase.
     */
    public List<PublicationSummaryResponse> execute(UUID storeId) {

        CatalogFilter filter = CatalogFilter.builder()
                .storeId(storeId)
                .build();

        List<Publication> publications =
                publicationRepository.findByFilters(filter);

        return publications.stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Convierte el modelo de dominio a DTO.
     */
    private PublicationSummaryResponse toResponse(
            Publication publication) {

        return PublicationSummaryResponse.builder()
                .id(publication.getId())
                .nombre(publication.getNombre())
                .descripcion(publication.getDescripcion())
                .precio(publication.getPrecio())
                .tipo(publication.getTipo())
                .stock(publication.getStock())
                .modalidadCobro(
                        publication.getModalidadCobro())
                .storeId(publication.getStoreId())
                .activa(publication.getActiva())
                .build();
    }
}