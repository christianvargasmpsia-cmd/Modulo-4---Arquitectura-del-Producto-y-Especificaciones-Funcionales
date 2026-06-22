package bo.umss.market.umss_market_api.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.enums.StoreStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Store {

    private UUID id;

    private UUID userId;

    private String nombre;

    private String descripcion;

    private String categoria;

    private String telefonoContacto;

    private String emailContacto;

    private StoreStatus status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
