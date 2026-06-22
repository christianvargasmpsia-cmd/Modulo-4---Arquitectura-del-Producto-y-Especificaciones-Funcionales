package bo.umss.market.umss_market_api.infrastructure.persistence.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.enums.StoreStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "stores")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StoreEntity {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private UUID userId;

    @Column(nullable = false)
    private String nombre;

    private String descripcion;

    private String categoria;

    private String telefonoContacto;

    private String emailContacto;

    @Enumerated(EnumType.STRING)
    private StoreStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}