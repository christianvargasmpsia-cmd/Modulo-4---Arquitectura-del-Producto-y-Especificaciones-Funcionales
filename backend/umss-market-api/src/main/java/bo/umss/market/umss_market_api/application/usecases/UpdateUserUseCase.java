package bo.umss.market.umss_market_api.application.usecases;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.UpdateUserRequest;
import bo.umss.market.umss_market_api.application.dto.UserSummaryResponse;
import bo.umss.market.umss_market_api.domain.exceptions.UserNotFoundException;
import bo.umss.market.umss_market_api.domain.model.User;
import bo.umss.market.umss_market_api.domain.ports.UserRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UpdateUserUseCase {

    private final UserRepositoryPort userRepository;

    public UserSummaryResponse execute(
            UUID id,
            UpdateUserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(UserNotFoundException::new);

        user.setRu(request.getRu());
        user.setNombre(request.getNombre());
        user.setApellidoPaterno(request.getApellidoPaterno());
        user.setApellidoMaterno(request.getApellidoMaterno());
        user.setEmail(request.getEmail());
        user.setCelular(request.getCelular());
        user.setFacultad(request.getFacultad());

        user.setUpdatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        return UserSummaryResponse.builder()
                .id(savedUser.getId())
                .ru(savedUser.getRu())
                .nombre(savedUser.getNombre())
                .apellidoPaterno(savedUser.getApellidoPaterno())
                .apellidoMaterno(savedUser.getApellidoMaterno())
                .email(savedUser.getEmail())
                .celular(savedUser.getCelular())
                .facultad(savedUser.getFacultad())
                .role(savedUser.getRole())
                .status(savedUser.getStatus())
                .ultimoLogin(savedUser.getUltimoLogin())
                .createdAt(savedUser.getCreatedAt())
                .updatedAt(savedUser.getUpdatedAt())
                .build();
    }
}