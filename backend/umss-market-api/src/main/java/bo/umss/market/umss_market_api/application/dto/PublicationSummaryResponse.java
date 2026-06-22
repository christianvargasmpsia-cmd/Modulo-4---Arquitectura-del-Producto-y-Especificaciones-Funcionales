package bo.umss.market.umss_market_api.application.dto;

import java.math.BigDecimal;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.enums.PaymentMode;
import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PublicationSummaryResponse {

    private UUID id;

    private String nombre;

    private String descripcion;

    private BigDecimal precio;

    private PublicationType tipo;

    private Integer stock;

    private PaymentMode modalidadCobro;

    private UUID storeId;

    private String nombreTienda;

    private Boolean activa;
}
