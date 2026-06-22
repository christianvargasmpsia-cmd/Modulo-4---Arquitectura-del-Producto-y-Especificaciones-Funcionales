package bo.umss.market.umss_market_api.application.usecases;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.RegisterEntrepreneurRequest;
import bo.umss.market.umss_market_api.application.dto.RegisterEntrepreneurResponse;
import bo.umss.market.umss_market_api.domain.enums.Role;
import bo.umss.market.umss_market_api.domain.enums.StoreStatus;
import bo.umss.market.umss_market_api.domain.enums.UserStatus;
import bo.umss.market.umss_market_api.domain.exceptions.EmailAlreadyExistsException;
import bo.umss.market.umss_market_api.domain.exceptions.StoreAlreadyExistsException;
import bo.umss.market.umss_market_api.domain.exceptions.UserAlreadyExistsException;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.model.User;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.UserRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RegisterEntrepreneurUseCase {

    private final UserRepositoryPort userRepository;
    private final StoreRepositoryPort storeRepository;
    private final PasswordEncoder passwordEncoder;

    public RegisterEntrepreneurResponse execute(RegisterEntrepreneurRequest request) {

        // RN-001: El RU debe ser único
        if (userRepository.existsByRu(request.getRu())) {
            throw new UserAlreadyExistsException();
        }

        // RN-002: El correo debe ser único
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException();
        }

        User user = User.builder()
                .id(UUID.randomUUID())
                .ru(request.getRu())
                .nombre(request.getNombre())
                .apellidoPaterno(request.getApellidoPaterno())
                .apellidoMaterno(request.getApellidoMaterno())
                .email(request.getEmail())
                .celular(request.getCelular())
                .facultad(request.getFacultad())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.EMPRENDEDOR)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        // RN-005: Un emprendedor solo puede tener una tienda
        if (storeRepository.existsByUserId(savedUser.getId())) {
            throw new StoreAlreadyExistsException();
        }

        Store store = Store.builder()
                .id(UUID.randomUUID())
                .userId(savedUser.getId())
                .nombre(request.getNombreTienda())
                .descripcion("")
                .categoria("")
                .telefonoContacto(request.getCelular())
                .emailContacto(request.getEmail())
                .status(StoreStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Store savedStore = storeRepository.save(store);

        return RegisterEntrepreneurResponse.builder()
                .success(true)
                .message("Emprendedor registrado correctamente")
                .usuarioId(savedUser.getId())
                .tiendaId(savedStore.getId())
                .build();
    }
}