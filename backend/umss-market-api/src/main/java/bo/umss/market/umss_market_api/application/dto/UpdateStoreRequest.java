package bo.umss.market.umss_market_api.application.dto;

import bo.umss.market.umss_market_api.domain.enums.StoreStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateStoreRequest {

    @NotBlank(message = "Nombre de tienda obligatorio")
    private String nombre;

    private String descripcion;

    private String categoria;

    @NotBlank(message = "Teléfono de contacto obligatorio")
    private String telefonoContacto;

    @Email(message = "Correo de contacto inválido")
    private String emailContacto;

    private StoreStatus status;
}