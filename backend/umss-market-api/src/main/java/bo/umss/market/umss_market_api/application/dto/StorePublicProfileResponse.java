package bo.umss.market.umss_market_api.application.dto;

import java.util.List;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.enums.StoreStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StorePublicProfileResponse {

    private UUID id;

    private String nombre;

    private String descripcion;

    private String categoria;

    private String telefonoContacto;

    private String emailContacto;

    private StoreStatus status;

    private List<PublicationInStoreResponse> publicaciones;
}
