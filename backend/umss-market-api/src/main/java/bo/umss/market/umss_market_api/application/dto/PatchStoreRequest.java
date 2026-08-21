package bo.umss.market.umss_market_api.application.dto;

import bo.umss.market.umss_market_api.domain.enums.StoreStatus;
import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class PatchStoreRequest {

    private String nombre;

    private String descripcion;

    private String categoria;

    private String telefonoContacto;

    @Email(message = "Correo de contacto inválido")
    private String emailContacto;

    private StoreStatus status;
}