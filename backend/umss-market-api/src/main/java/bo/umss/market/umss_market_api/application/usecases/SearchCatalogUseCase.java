package bo.umss.market.umss_market_api.application.usecases;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.CatalogFilterRequest;
import bo.umss.market.umss_market_api.application.dto.PublicationSummaryResponse;
import bo.umss.market.umss_market_api.domain.exceptions.InvalidPriceRangeException;
import bo.umss.market.umss_market_api.domain.model.CatalogFilter;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SearchCatalogUseCase {

    private final PublicationRepositoryPort publicationRepository;
    private final StoreRepositoryPort storeRepository;

    public List<PublicationSummaryResponse> execute(CatalogFilterRequest request) {

        if (request.getPrecioMin() != null && request.getPrecioMax() != null
                && request.getPrecioMin().compareTo(request.getPrecioMax()) > 0) {
            throw new InvalidPriceRangeException(
                    "precioMin no puede ser mayor que precioMax");
        }

        String textoNormalizado = request.getTexto() != null
                ? request.getTexto().trim()
                : null;

        CatalogFilter filter = CatalogFilter.builder()
                .textoBusqueda(textoNormalizado)
                .tipo(request.getTipo())
                .precioMin(request.getPrecioMin())
                .precioMax(request.getPrecioMax())
                .storeId(request.getStoreId())
                .build();

        return publicationRepository.findByFilters(filter)
                .stream()
                .map(publication -> {
                    Optional<Store> store = storeRepository.findById(publication.getStoreId());
                    String nombreTienda = store.map(Store::getNombre).orElse(null);

                    return PublicationSummaryResponse.builder()
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
                            .build();
                })
                .toList();
    }
}
