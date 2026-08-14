package bo.umss.market.umss_market_api.infrastructure.persistence.mappers;

import bo.umss.market.umss_market_api.domain.model.Interaction;
import bo.umss.market.umss_market_api.infrastructure.persistence.entities.InteractionEntity;

public final class InteractionMapper {

    private InteractionMapper() {
    }

    public static InteractionEntity toEntity(Interaction interaction) {

        if (interaction == null) {
            return null;
        }

        return InteractionEntity.builder()
                .id(interaction.getId())
                .userId(interaction.getUserId())
                .publicationId(interaction.getPublicationId())
                .type(interaction.getType())
                .metadata(interaction.getMetadata())
                .createdAt(interaction.getCreatedAt())
                .updatedAt(interaction.getUpdatedAt())
                .build();
    }

    public static Interaction toDomain(InteractionEntity entity) {

        if (entity == null) {
            return null;
        }

        return Interaction.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .publicationId(entity.getPublicationId())
                .type(entity.getType())
                .metadata(entity.getMetadata())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}