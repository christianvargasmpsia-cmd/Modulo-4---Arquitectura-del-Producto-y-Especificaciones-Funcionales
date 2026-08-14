package bo.umss.market.umss_market_api.infrastructure.adapters;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Component;

import bo.umss.market.umss_market_api.domain.enums.InteractionType;
import bo.umss.market.umss_market_api.domain.model.Interaction;
import bo.umss.market.umss_market_api.domain.ports.InteractionRepositoryPort;
import bo.umss.market.umss_market_api.infrastructure.persistence.mappers.InteractionMapper;
import bo.umss.market.umss_market_api.infrastructure.persistence.repositories.JpaInteractionRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JpaInteractionRepositoryAdapter
        implements InteractionRepositoryPort {

    private final JpaInteractionRepository repository;

    @Override
    public Interaction save(Interaction interaction) {

        return InteractionMapper.toDomain(
                repository.save(
                        InteractionMapper.toEntity(interaction)
                )
        );
    }

    @Override
    public List<Interaction> findByUserId(UUID userId) {

        return repository.findByUserId(userId)
                .stream()
                .map(InteractionMapper::toDomain)
                .toList();
    }

    @Override
    public List<Interaction> findRecentByUserId(
            UUID userId,
            int limit
    ) {

        return repository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .limit(limit)
                .map(InteractionMapper::toDomain)
                .toList();
    }

    @Override
    public List<Interaction> findByUserIdAndType(
            UUID userId,
            InteractionType type
    ) {

        return repository
                .findByUserIdAndType(userId, type)
                .stream()
                .map(InteractionMapper::toDomain)
                .toList();
    }
}