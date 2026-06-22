package bo.umss.market.umss_market_api.application.dto;

import java.math.BigDecimal;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.enums.PaymentMode;
import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PublicationInStoreResponse {

    private UUID id;

    private String nombre;

    private BigDecimal precio;

    private PublicationType tipo;

    private Integer stock;

    private PaymentMode modalidadCobro;

    private Boolean activa;
}
