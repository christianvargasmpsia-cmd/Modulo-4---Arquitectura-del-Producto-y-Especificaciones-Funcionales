package bo.umss.market.umss_market_api.application.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.enums.StoreStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StoreSummaryResponse {

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