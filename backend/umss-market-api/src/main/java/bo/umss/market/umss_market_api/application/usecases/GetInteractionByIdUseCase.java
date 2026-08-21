package bo.umss.market.umss_market_api.application.usecases;

import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.InteractionResponse;
import bo.umss.market.umss_market_api.domain.model.Interaction;
import bo.umss.market.umss_market_api.domain.ports.InteractionRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetInteractionByIdUseCase {

    private final InteractionRepositoryPort interactionRepository;

    public InteractionResponse execute(UUID id) {

        Interaction interaction =
                interactionRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Interacción no encontrada"
                                )
                        );

        return toResponse(interaction);
    }

    private InteractionResponse toResponse(
            Interaction interaction) {

        return InteractionResponse.builder()
                .id(interaction.getId())
                .userId(interaction.getUserId())
                .publicationId(interaction.getPublicationId())
                .type(interaction.getType())
                .metadata(interaction.getMetadata())
                .createdAt(interaction.getCreatedAt())
                .updatedAt(interaction.getUpdatedAt())
                .build();
    }
}