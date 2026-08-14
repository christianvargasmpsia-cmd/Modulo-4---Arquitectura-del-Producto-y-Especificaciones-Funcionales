package bo.umss.market.umss_market_api.infrastructure.persistence.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import bo.umss.market.umss_market_api.domain.enums.InteractionType;
import bo.umss.market.umss_market_api.infrastructure.persistence.entities.InteractionEntity;

public interface JpaInteractionRepository
        extends JpaRepository<InteractionEntity, UUID> {

    List<InteractionEntity> findByUserId(UUID userId);

    List<InteractionEntity> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<InteractionEntity> findByUserIdAndType(
            UUID userId,
            InteractionType type
    );
}