package bo.umss.market.umss_market_api.domain.ports;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.model.CatalogFilter;
import bo.umss.market.umss_market_api.domain.model.Publication;

public interface PublicationRepositoryPort {

    Publication save(Publication publication);

    List<Publication> findAll();

    Optional<Publication> findById(UUID id);

    List<Publication> findByFilters(CatalogFilter filter);

    void deleteById(UUID id);
}