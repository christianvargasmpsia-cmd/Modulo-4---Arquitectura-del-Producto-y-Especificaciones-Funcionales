package bo.umss.market.umss_market_api.domain.model;

import java.math.BigDecimal;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class CatalogFilter {

    String textoBusqueda;

    PublicationType tipo;

    BigDecimal precioMin;

    BigDecimal precioMax;

    UUID storeId;
}
