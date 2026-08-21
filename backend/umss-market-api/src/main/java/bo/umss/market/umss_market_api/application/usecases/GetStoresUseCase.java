package bo.umss.market.umss_market_api.application.usecases;

import java.util.List;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.StoreSummaryResponse;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetStoresUseCase {

    private final StoreRepositoryPort storeRepository;

    public List<StoreSummaryResponse> execute() {

        return storeRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private StoreSummaryResponse toResponse(Store store) {

        return StoreSummaryResponse.builder()
                .id(store.getId())
                .userId(store.getUserId())
                .nombre(store.getNombre())
                .descripcion(store.getDescripcion())
                .categoria(store.getCategoria())
                .telefonoContacto(store.getTelefonoContacto())
                .emailContacto(store.getEmailContacto())
                .status(store.getStatus())
                .createdAt(store.getCreatedAt())
                .updatedAt(store.getUpdatedAt())
                .build();
    }
}