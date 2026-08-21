package bo.umss.market.umss_market_api.application.usecases;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.UpdateUserStatusRequest;
import bo.umss.market.umss_market_api.application.dto.UserSummaryResponse;
import bo.umss.market.umss_market_api.domain.exceptions.UserNotFoundException;
import bo.umss.market.umss_market_api.domain.model.User;
import bo.umss.market.umss_market_api.domain.ports.UserRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UpdateUserStatusUseCase {

    private final UserRepositoryPort userRepository;

    public UserSummaryResponse execute(
            UUID id,
            UpdateUserStatusRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(UserNotFoundException::new);

        user.setStatus(request.getStatus());
        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        return toResponse(savedUser);
    }

    private UserSummaryResponse toResponse(User user) {

        return UserSummaryResponse.builder()
                .id(user.getId())
                .ru(user.getRu())
                .nombre(user.getNombre())
                .apellidoPaterno(user.getApellidoPaterno())
                .apellidoMaterno(user.getApellidoMaterno())
                .email(user.getEmail())
                .celular(user.getCelular())
                .facultad(user.getFacultad())
                .role(user.getRole())
                .status(user.getStatus())
                .ultimoLogin(user.getUltimoLogin())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}