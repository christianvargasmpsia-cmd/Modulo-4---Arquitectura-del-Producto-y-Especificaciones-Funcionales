package bo.umss.market.umss_market_api.infrastructure.persistence.repositories;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import bo.umss.market.umss_market_api.infrastructure.persistence.entities.PublicationEntity;

public interface JpaPublicationRepository
        extends JpaRepository<PublicationEntity, UUID> {
}