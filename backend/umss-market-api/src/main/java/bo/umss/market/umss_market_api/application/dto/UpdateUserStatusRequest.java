package bo.umss.market.umss_market_api.application.dto;

import bo.umss.market.umss_market_api.domain.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateUserStatusRequest {

    @NotNull(message = "El estado es obligatorio")
    private UserStatus status;
}