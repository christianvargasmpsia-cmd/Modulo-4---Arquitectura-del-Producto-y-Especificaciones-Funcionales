package bo.umss.market.umss_market_api.application.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterCustomerRequest {

    @NotBlank(message = "RU obligatorio")
    @Pattern(
            regexp = "^[0-9]{9}$",
            message = "El RU debe contener exactamente 9 dígitos")
    private String ru;

    @NotBlank(message = "Nombre obligatorio")
    private String nombre;

    @NotBlank(message = "Apellido paterno obligatorio")
    private String apellidoPaterno;

    private String apellidoMaterno;

    @NotBlank(message = "Correo obligatorio")
    @Email(message = "Correo inválido")
    @Pattern(
            regexp = "^[A-Za-z0-9._%+-]+@umss\\.edu\\.bo$",
            message = "Debe utilizar un correo institucional UMSS")
    private String email;

    @NotBlank(message = "Celular obligatorio")
    @Pattern(
            regexp = "^[0-9]{8}$",
            message = "El celular debe contener 8 dígitos")
    private String celular;

    @NotBlank(message = "Facultad obligatoria")
    private String facultad;

    @NotBlank(message = "Contraseña obligatoria")
    @Size(
            min = 6,
            message = "La contraseña debe tener al menos 6 caracteres")
    private String password;
}