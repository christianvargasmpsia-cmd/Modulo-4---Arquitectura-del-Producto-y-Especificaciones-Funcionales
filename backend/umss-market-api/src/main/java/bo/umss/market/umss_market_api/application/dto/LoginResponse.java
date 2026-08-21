package bo.umss.market.umss_market_api.application.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {

    private String token;

    private UUID userId;

    private String email;

    private String role;
}