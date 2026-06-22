package bo.umss.market.umss_market_api.infrastructure.persistence.entities;


import java.time.LocalDateTime;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.enums.Role;
import bo.umss.market.umss_market_api.domain.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String ru;

    @Column(nullable = false)
    private String nombre;

    private String apellidoPaterno;

    private String apellidoMaterno;

    @Column(nullable = false, unique = true)
    private String email;

    private String celular;

    private String facultad;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    private LocalDateTime ultimoLogin;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}