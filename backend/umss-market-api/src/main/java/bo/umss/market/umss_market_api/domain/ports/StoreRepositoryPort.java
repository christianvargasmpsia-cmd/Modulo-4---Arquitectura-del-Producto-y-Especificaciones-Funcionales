package bo.umss.market.umss_market_api.domain.ports;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.model.Store;

public interface StoreRepositoryPort {

    Store save(Store store);

    Optional<Store> findById(UUID id);

    Optional<Store> findByUserId(UUID userId);

    boolean existsByUserId(UUID userId);

    List<Store> findAll();

    void deleteById(UUID id);
}