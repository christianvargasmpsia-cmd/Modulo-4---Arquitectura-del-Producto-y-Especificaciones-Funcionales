package bo.umss.market.umss_market_api.infrastructure.adapters;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.infrastructure.persistence.entities.PublicationEntity;
import bo.umss.market.umss_market_api.infrastructure.persistence.repositories.JpaPublicationRepository;

@ExtendWith(MockitoExtension.class)
class JpaPublicationRepositoryAdapterTest {

    @Mock
    private JpaPublicationRepository repository;

    @InjectMocks
    private JpaPublicationRepositoryAdapter adapter;

    @Test
    void shouldSavePublication() {

        UUID id = UUID.randomUUID();

        Publication publication = Publication.builder()
                .id(id)
                .storeId(UUID.randomUUID())
                .nombre("Brownie")
                .precio(BigDecimal.TEN)
                .tipo(PublicationType.PRODUCTO)
                .build();

        PublicationEntity entity = PublicationEntity.builder()
                .id(id)
                .storeId(publication.getStoreId())
                .nombre("Brownie")
                .precio(BigDecimal.TEN)
                .tipo(PublicationType.PRODUCTO)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(repository.save(any(PublicationEntity.class)))
                .thenReturn(entity);

        Publication result = adapter.save(publication);

        assertNotNull(result);
        assertEquals(id, result.getId());
    }

    @Test
    void shouldFindAll() {

        PublicationEntity entity = PublicationEntity.builder()
                .id(UUID.randomUUID())
                .nombre("Producto")
                .precio(BigDecimal.TEN)
                .tipo(PublicationType.PRODUCTO)
                .build();

        when(repository.findAll())
                .thenReturn(List.of(entity));

        List<Publication> result = adapter.findAll();

        assertEquals(1, result.size());
    }

    @Test
    void shouldFindById() {

        UUID id = UUID.randomUUID();

        PublicationEntity entity = PublicationEntity.builder()
                .id(id)
                .nombre("Producto")
                .precio(BigDecimal.TEN)
                .tipo(PublicationType.PRODUCTO)
                .build();

        when(repository.findById(id))
                .thenReturn(Optional.of(entity));

        Optional<Publication> result = adapter.findById(id);

        assertTrue(result.isPresent());
    }
}
