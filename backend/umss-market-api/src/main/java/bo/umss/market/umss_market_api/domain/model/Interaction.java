package bo.umss.market.umss_market_api.domain.model;

import java.time.LocalDateTime;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.enums.InteractionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Interaction {

    private UUID id;

    private UUID userId;

    private UUID publicationId;

    private InteractionType type;

    private String metadata;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}