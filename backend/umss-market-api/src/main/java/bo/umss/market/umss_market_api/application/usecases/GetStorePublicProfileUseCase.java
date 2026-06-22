package bo.umss.market.umss_market_api.application.usecases;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.PublicationInStoreResponse;
import bo.umss.market.umss_market_api.application.dto.StorePublicProfileResponse;
import bo.umss.market.umss_market_api.domain.exceptions.StoreNotFoundException;
import bo.umss.market.umss_market_api.domain.model.CatalogFilter;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetStorePublicProfileUseCase {

    private final StoreRepositoryPort storeRepository;
    private final PublicationRepositoryPort publicationRepository;

    public StorePublicProfileResponse execute(UUID storeId) {

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new StoreNotFoundException(
                        "Tienda no encontrada"));

        CatalogFilter filter = CatalogFilter.builder()
                .storeId(storeId)
                .build();

        List<PublicationInStoreResponse> publicaciones =
                publicationRepository.findByFilters(filter)
                        .stream()
                        .map(p -> PublicationInStoreResponse.builder()
                                .id(p.getId())
                                .nombre(p.getNombre())
                                .precio(p.getPrecio())
                                .tipo(p.getTipo())
                                .stock(p.getStock())
                                .modalidadCobro(p.getModalidadCobro())
                                .activa(p.getActiva())
                                .build())
                        .toList();

        return StorePublicProfileResponse.builder()
                .id(store.getId())
                .nombre(store.getNombre())
                .descripcion(store.getDescripcion())
                .categoria(store.getCategoria())
                .telefonoContacto(store.getTelefonoContacto())
                .emailContacto(store.getEmailContacto())
                .status(store.getStatus())
                .publicaciones(publicaciones)
                .build();
    }
}
