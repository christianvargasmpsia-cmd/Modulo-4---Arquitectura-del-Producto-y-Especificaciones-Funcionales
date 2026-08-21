package bo.umss.market.umss_market_api.application.usecases;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import bo.umss.market.umss_market_api.domain.exceptions.StoreNotFoundException;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.UserRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeleteStoreUseCase {

    private final StoreRepositoryPort storeRepository;

    private final UserRepositoryPort userRepository;

    @Transactional
    public void execute(UUID id) {

        Store store = storeRepository.findById(id)
                .orElseThrow(
                        () -> new StoreNotFoundException(
                                "Tienda no encontrada"
                        )
                );

        UUID userId = store.getUserId();

        // Primero eliminamos la tienda
        storeRepository.deleteById(id);

        // Luego eliminamos al usuario propietario
        userRepository.deleteById(userId);
    }
}