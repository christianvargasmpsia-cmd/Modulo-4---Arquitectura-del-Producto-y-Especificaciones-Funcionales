package bo.umss.market.umss_market_api.application.usecases;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.UpdateStoreRequest;
import bo.umss.market.umss_market_api.domain.exceptions.StoreNotFoundException;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UpdateStoreUseCase {

    private final StoreRepositoryPort storeRepository;

    public Store execute(
            UUID id,
            UpdateStoreRequest request) {

        Store store = storeRepository.findById(id)
                .orElseThrow(
                        () -> new StoreNotFoundException(
                                "Tienda no encontrada"));

        store.setNombre(request.getNombre());
        store.setDescripcion(request.getDescripcion());
        store.setCategoria(request.getCategoria());
        store.setTelefonoContacto(
                request.getTelefonoContacto());
        store.setEmailContacto(
                request.getEmailContacto());
        store.setStatus(request.getStatus());

        store.setUpdatedAt(LocalDateTime.now());

        return storeRepository.save(store);
    }
}