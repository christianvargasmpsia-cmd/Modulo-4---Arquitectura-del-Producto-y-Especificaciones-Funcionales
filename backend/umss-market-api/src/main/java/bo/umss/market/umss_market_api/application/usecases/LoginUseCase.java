package bo.umss.market.umss_market_api.application.usecases;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.LoginRequest;
import bo.umss.market.umss_market_api.application.dto.LoginResponse;
import bo.umss.market.umss_market_api.domain.exceptions.UserNotFoundException;
import bo.umss.market.umss_market_api.domain.model.User;
import bo.umss.market.umss_market_api.domain.ports.UserRepositoryPort;
import bo.umss.market.umss_market_api.infrastructure.security.JwtService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoginUseCase {

    private final UserRepositoryPort userRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    public LoginResponse execute(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(UserNotFoundException::new);

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash())) {

            throw new RuntimeException(
                    "Credenciales inválidas");
        }

        if (user.getStatus() == null ||
                !user.getStatus().name().equals("ACTIVE")) {

            throw new RuntimeException(
                    "Usuario inactivo");
        }

        user.setUltimoLogin(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail(),
                user.getRole().name());

        return LoginResponse.builder()
                .token(token)
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}