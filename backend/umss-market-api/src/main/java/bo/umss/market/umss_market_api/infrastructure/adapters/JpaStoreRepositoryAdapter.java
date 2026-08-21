package bo.umss.market.umss_market_api.infrastructure.adapters;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;
import bo.umss.market.umss_market_api.infrastructure.persistence.mappers.StoreMapper;
import bo.umss.market.umss_market_api.infrastructure.persistence.repositories.JpaStoreRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JpaStoreRepositoryAdapter implements StoreRepositoryPort {

    private final JpaStoreRepository repository;

    @Override
    public Store save(Store store) {
        return StoreMapper.toDomain(
                repository.save(
                        StoreMapper.toEntity(store)
                )
        );
    }

    @Override
    public Optional<Store> findById(UUID id) {
        return repository.findById(id)
                .map(StoreMapper::toDomain);
    }

    @Override
    public Optional<Store> findByUserId(UUID userId) {
        return repository.findByUserId(userId)
                .map(StoreMapper::toDomain);
    }

    @Override
    public boolean existsByUserId(UUID userId) {
        return repository.existsByUserId(userId);
    }

    @Override
    public List<Store> findAll() {
        return repository.findAll()
                .stream()
                .map(StoreMapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}