package bo.umss.market.umss_market_api.application.dto;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ErrorResponse {

    private boolean success;
    private String message;
    private LocalDateTime timestamp;
}