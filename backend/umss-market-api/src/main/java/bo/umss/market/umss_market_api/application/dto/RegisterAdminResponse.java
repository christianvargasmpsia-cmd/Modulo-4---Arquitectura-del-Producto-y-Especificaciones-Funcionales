package bo.umss.market.umss_market_api.application.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegisterAdminResponse {

    private boolean success;

    private String message;

    private UUID usuarioId;
}