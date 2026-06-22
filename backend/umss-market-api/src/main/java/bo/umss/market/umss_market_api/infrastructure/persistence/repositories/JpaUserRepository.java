package bo.umss.market.umss_market_api.infrastructure.persistence.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import bo.umss.market.umss_market_api.infrastructure.persistence.entities.UserEntity;

public interface JpaUserRepository extends JpaRepository<UserEntity, UUID> {

    Optional<UserEntity> findByRu(String ru);

    Optional<UserEntity> findByEmail(String email);

    boolean existsByRu(String ru);

    boolean existsByEmail(String email);
}