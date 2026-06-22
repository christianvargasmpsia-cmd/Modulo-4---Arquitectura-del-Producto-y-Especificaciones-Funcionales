package bo.umss.market.umss_market_api.application.dto;

import java.math.BigDecimal;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import lombok.Data;

@Data
public class CatalogFilterRequest {

    private String texto;

    private PublicationType tipo;

    private BigDecimal precioMin;

    private BigDecimal precioMax;

    private UUID storeId;
}
