package bo.umss.market.umss_market_api.application.usecases;

import java.util.List;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.UserSummaryResponse;
import bo.umss.market.umss_market_api.domain.model.User;
import bo.umss.market.umss_market_api.domain.ports.UserRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetUsersUseCase {

    private final UserRepositoryPort userRepository;

    public List<UserSummaryResponse> execute() {

        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
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