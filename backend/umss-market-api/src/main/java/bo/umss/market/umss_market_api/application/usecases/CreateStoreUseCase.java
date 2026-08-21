package bo.umss.market.umss_market_api.application.usecases;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.CreateStoreRequest;
import bo.umss.market.umss_market_api.application.dto.CreateStoreResponse;
import bo.umss.market.umss_market_api.domain.enums.Role;
import bo.umss.market.umss_market_api.domain.enums.StoreStatus;
import bo.umss.market.umss_market_api.domain.exceptions.StoreAlreadyExistsException;
import bo.umss.market.umss_market_api.domain.exceptions.UserNotFoundException;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.model.User;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.UserRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CreateStoreUseCase {

    private final StoreRepositoryPort storeRepository;
    private final UserRepositoryPort userRepository;

    public CreateStoreResponse execute(CreateStoreRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(UserNotFoundException::new);

        if (user.getRole() != Role.EMPRENDEDOR) {
            throw new IllegalArgumentException(
                    "Solo un emprendedor puede tener una tienda");
        }

        if (storeRepository.existsByUserId(request.getUserId())) {
            throw new StoreAlreadyExistsException();
        }

        Store store = Store.builder()
                .id(UUID.randomUUID())
                .userId(user.getId())
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .categoria(request.getCategoria())
                .telefonoContacto(request.getTelefonoContacto())
                .emailContacto(request.getEmailContacto())
                .status(
                        request.getStatus() != null
                                ? request.getStatus()
                                : StoreStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Store savedStore = storeRepository.save(store);

        return CreateStoreResponse.builder()
                .success(true)
                .message("Tienda creada correctamente")
                .storeId(savedStore.getId())
                .userId(savedStore.getUserId())
                .build();
    }
}