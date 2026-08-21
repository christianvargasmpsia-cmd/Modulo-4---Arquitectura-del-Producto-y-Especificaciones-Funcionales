package bo.umss.market.umss_market_api.application.usecases;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.RegisterAdminRequest;
import bo.umss.market.umss_market_api.application.dto.RegisterAdminResponse;
import bo.umss.market.umss_market_api.domain.enums.Role;
import bo.umss.market.umss_market_api.domain.enums.UserStatus;
import bo.umss.market.umss_market_api.domain.exceptions.EmailAlreadyExistsException;
import bo.umss.market.umss_market_api.domain.exceptions.UserAlreadyExistsException;
import bo.umss.market.umss_market_api.domain.model.User;
import bo.umss.market.umss_market_api.domain.ports.UserRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RegisterAdminUseCase {

    private final UserRepositoryPort userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegisterAdminResponse execute(
            RegisterAdminRequest request) {

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
                .passwordHash(
                        passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        return RegisterAdminResponse.builder()
                .success(true)
                .message("Administrador registrado correctamente")
                .usuarioId(savedUser.getId())
                .build();
    }
}