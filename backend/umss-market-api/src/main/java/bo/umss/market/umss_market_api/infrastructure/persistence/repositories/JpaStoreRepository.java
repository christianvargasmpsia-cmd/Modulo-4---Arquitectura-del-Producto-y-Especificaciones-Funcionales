package bo.umss.market.umss_market_api.infrastructure.persistence.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import bo.umss.market.umss_market_api.infrastructure.persistence.entities.StoreEntity;

public interface JpaStoreRepository extends JpaRepository<StoreEntity, UUID> {

    Optional<StoreEntity> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);
}