package bo.umss.market.umss_market_api.application.usecases;

import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.CreateInteractionRequest;
import bo.umss.market.umss_market_api.application.dto.InteractionResponse;
import bo.umss.market.umss_market_api.domain.model.Interaction;
import bo.umss.market.umss_market_api.domain.ports.InteractionRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CreateInteractionUseCase {

    private final InteractionRepositoryPort interactionRepository;

    public InteractionResponse execute(
            UUID userId,
            CreateInteractionRequest request) {

        Interaction interaction =
                Interaction.builder()
                        .userId(userId)
                        .publicationId(request.getPublicationId())
                        .type(request.getType())
                        .metadata(request.getMetadata())
                        .build();

        Interaction saved =
                interactionRepository.save(interaction);

        return toResponse(saved);
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