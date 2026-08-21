package bo.umss.market.umss_market_api.application.usecases;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.PatchStoreRequest;
import bo.umss.market.umss_market_api.domain.exceptions.StoreNotFoundException;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PatchStoreUseCase {

    private final StoreRepositoryPort storeRepository;

    public Store execute(
            UUID id,
            PatchStoreRequest request) {

        Store store = storeRepository.findById(id)
                .orElseThrow(
                        () -> new StoreNotFoundException(
                                "Tienda no encontrada"));

        if (request.getNombre() != null) {
            store.setNombre(request.getNombre());
        }

        if (request.getDescripcion() != null) {
            store.setDescripcion(request.getDescripcion());
        }

        if (request.getCategoria() != null) {
            store.setCategoria(request.getCategoria());
        }

        if (request.getTelefonoContacto() != null) {
            store.setTelefonoContacto(
                    request.getTelefonoContacto());
        }

        if (request.getEmailContacto() != null) {
            store.setEmailContacto(
                    request.getEmailContacto());
        }

        if (request.getStatus() != null) {
            store.setStatus(request.getStatus());
        }

        store.setUpdatedAt(LocalDateTime.now());

        return storeRepository.save(store);
    }
}