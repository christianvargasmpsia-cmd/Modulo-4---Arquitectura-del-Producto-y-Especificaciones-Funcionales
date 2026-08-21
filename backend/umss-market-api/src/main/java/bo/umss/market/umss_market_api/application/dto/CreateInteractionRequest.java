package bo.umss.market.umss_market_api.application.dto;

import java.util.UUID;

import bo.umss.market.umss_market_api.domain.enums.InteractionType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateInteractionRequest {

    @NotNull
    private UUID publicationId;

    @NotNull
    private InteractionType type;

    private String metadata;
}