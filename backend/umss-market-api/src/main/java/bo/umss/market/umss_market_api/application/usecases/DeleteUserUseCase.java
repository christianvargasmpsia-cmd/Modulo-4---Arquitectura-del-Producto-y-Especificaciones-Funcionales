package bo.umss.market.umss_market_api.application.usecases;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import bo.umss.market.umss_market_api.domain.exceptions.UserNotFoundException;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.model.User;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.UserRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeleteUserUseCase {

    private final UserRepositoryPort userRepository;

    private final StoreRepositoryPort storeRepository;

    @Transactional
    public void execute(UUID id) {

        User user = userRepository.findById(id)
                .orElseThrow(UserNotFoundException::new);

        /*
         * Si el usuario es EMPRENDEDOR,
         * primero eliminamos su tienda.
         */
        if ("EMPRENDEDOR".equals(
                String.valueOf(user.getRole()))) {

            Store store = storeRepository.findByUserId(id)
                    .orElse(null);

            if (store != null) {
                storeRepository.deleteById(store.getId());
            }
        }

        /*
         * ADMIN y COMPRADOR:
         * solamente se elimina el usuario.
         *
         * EMPRENDEDOR:
         * primero se elimina su tienda
         * y luego el usuario.
         */
        userRepository.deleteById(id);
    }
}