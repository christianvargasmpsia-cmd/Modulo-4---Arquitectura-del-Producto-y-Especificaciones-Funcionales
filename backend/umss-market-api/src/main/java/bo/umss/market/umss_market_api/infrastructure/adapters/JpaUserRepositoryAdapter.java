package bo.umss.market.umss_market_api.infrastructure.adapters;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import bo.umss.market.umss_market_api.domain.model.User;
import bo.umss.market.umss_market_api.domain.ports.UserRepositoryPort;
import bo.umss.market.umss_market_api.infrastructure.persistence.mappers.UserMapper;
import bo.umss.market.umss_market_api.infrastructure.persistence.repositories.JpaUserRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JpaUserRepositoryAdapter implements UserRepositoryPort {

    private final JpaUserRepository repository;

    @Override
    public User save(User user) {
        return UserMapper.toDomain(
                repository.save(
                        UserMapper.toEntity(user)
                )
        );
    }

    @Override
    public Optional<User> findById(UUID id) {
        return repository.findById(id)
                .map(UserMapper::toDomain);
    }

    @Override
    public List<User> findAll() {
        return repository.findAll()
                .stream()
                .map(UserMapper::toDomain)
                .toList();
    }

    @Override
    public Optional<User> findByRu(String ru) {
        return repository.findByRu(ru)
                .map(UserMapper::toDomain);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return repository.findByEmail(email)
                .map(UserMapper::toDomain);
    }

    @Override
    public boolean existsByRu(String ru) {
        return repository.existsByRu(ru);
    }

    @Override
    public boolean existsByEmail(String email) {
        return repository.existsByEmail(email);
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}