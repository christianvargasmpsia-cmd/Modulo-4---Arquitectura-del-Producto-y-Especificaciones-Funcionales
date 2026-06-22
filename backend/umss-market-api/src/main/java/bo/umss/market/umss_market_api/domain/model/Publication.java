package bo.umss.market.umss_market_api.domain.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.enums.PaymentMode;
import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Publication {

    private UUID id;

    private UUID storeId;

    private String nombre;

    private String descripcion;

    private BigDecimal precio;

    private PublicationType tipo;

    private Integer stock;

    private PaymentMode modalidadCobro;

    private Boolean activa;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}