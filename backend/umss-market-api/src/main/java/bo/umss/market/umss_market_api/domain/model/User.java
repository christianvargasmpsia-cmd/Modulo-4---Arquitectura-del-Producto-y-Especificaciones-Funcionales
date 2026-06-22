package bo.umss.market.umss_market_api.domain.model;


import java.time.LocalDateTime;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.enums.Role;
import bo.umss.market.umss_market_api.domain.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    private UUID id;

    private String ru;

    private String nombre;

    private String apellidoPaterno;

    private String apellidoMaterno;

    private String email;

    private String celular;

    private String facultad;

    private String passwordHash;

    private Role role;

    private UserStatus status;

    private LocalDateTime ultimoLogin;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}