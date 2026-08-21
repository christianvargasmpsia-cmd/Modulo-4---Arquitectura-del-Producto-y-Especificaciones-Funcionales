package bo.umss.market.umss_market_api.application.usecases;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.application.dto.InteractionResponse;
import bo.umss.market.umss_market_api.domain.model.Interaction;
import bo.umss.market.umss_market_api.domain.ports.InteractionRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GetUserInteractionsUseCase {

    private final InteractionRepositoryPort interactionRepository;

    public List<InteractionResponse> execute(UUID userId) {

        return interactionRepository
                .findByUserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
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