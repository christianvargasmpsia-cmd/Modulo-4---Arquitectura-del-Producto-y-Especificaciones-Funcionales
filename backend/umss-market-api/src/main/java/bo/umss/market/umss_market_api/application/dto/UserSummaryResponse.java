package bo.umss.market.umss_market_api.application.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.enums.Role;
import bo.umss.market.umss_market_api.domain.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserSummaryResponse {

    private UUID id;

    private String ru;

    private String nombre;

    private String apellidoPaterno;

    private String apellidoMaterno;

    private String email;

    private String celular;

    private String facultad;

    private Role role;

    private UserStatus status;

    private LocalDateTime ultimoLogin;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}