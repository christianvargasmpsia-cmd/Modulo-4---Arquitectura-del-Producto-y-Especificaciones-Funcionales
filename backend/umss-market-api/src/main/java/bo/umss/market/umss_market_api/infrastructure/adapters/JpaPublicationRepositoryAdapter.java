package bo.umss.market.umss_market_api.infrastructure.adapters;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Component;

import bo.umss.market.umss_market_api.domain.model.CatalogFilter;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import bo.umss.market.umss_market_api.infrastructure.persistence.mappers.PublicationMapper;
import bo.umss.market.umss_market_api.infrastructure.persistence.repositories.JpaPublicationRepository;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JpaPublicationRepositoryAdapter
        implements PublicationRepositoryPort {

    private final JpaPublicationRepository repository;

    @Override
    public Publication save(Publication publication) {

        return PublicationMapper.toDomain(
                repository.save(
                        PublicationMapper.toEntity(publication)));
    }

    @Override
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
    @Override
    public List<Publication> findAll() {

        return repository.findAll()
                .stream()
                .map(PublicationMapper::toDomain)
                .toList();
    }

    @Override
    public Optional<Publication> findById(UUID id) {

        return repository.findById(id)
                .map(PublicationMapper::toDomain);
    }

    @Override
    public List<Publication> findByFilters(CatalogFilter filter) {

        return repository.findByFilters(
                filter.getTextoBusqueda(),
                filter.getTipo(),
                filter.getPrecioMin(),
                filter.getPrecioMax(),
                filter.getStoreId())
                .stream()
                .map(PublicationMapper::toDomain)
                .toList();
    }
}