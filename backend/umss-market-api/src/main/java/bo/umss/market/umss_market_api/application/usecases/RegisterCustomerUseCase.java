package bo.umss.market.umss_market_api.application.usecases;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.RegisterCustomerRequest;
import bo.umss.market.umss_market_api.application.dto.RegisterCustomerResponse;
import bo.umss.market.umss_market_api.domain.enums.Role;
import bo.umss.market.umss_market_api.domain.enums.UserStatus;
import bo.umss.market.umss_market_api.domain.exceptions.EmailAlreadyExistsException;
import bo.umss.market.umss_market_api.domain.exceptions.UserAlreadyExistsException;
import bo.umss.market.umss_market_api.domain.model.User;
import bo.umss.market.umss_market_api.domain.ports.UserRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RegisterCustomerUseCase {

    private final UserRepositoryPort userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegisterCustomerResponse execute(
            RegisterCustomerRequest request) {

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
                .role(Role.COMPRADOR)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User savedUser = userRepository.save(user);

        return RegisterCustomerResponse.builder()
                .success(true)
                .message("Comprador registrado correctamente")
                .usuarioId(savedUser.getId())
                .build();
    }
}