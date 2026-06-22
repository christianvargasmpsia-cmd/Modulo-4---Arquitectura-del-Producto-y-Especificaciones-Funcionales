package bo.umss.market.umss_market_api.domain.ports;

import java.util.Optional;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.model.User;

public interface UserRepositoryPort {

    User save(User user);

    Optional<User> findById(UUID id);

    Optional<User> findByRu(String ru);

    Optional<User> findByEmail(String email);

    boolean existsByRu(String ru);

    boolean existsByEmail(String email);
}