package bo.umss.market.umss_market_api.infrastructure.adapters;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import bo.umss.market.umss_market_api.domain.enums.StoreStatus;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.infrastructure.persistence.entities.StoreEntity;
import bo.umss.market.umss_market_api.infrastructure.persistence.repositories.JpaStoreRepository;

@ExtendWith(MockitoExtension.class)
class JpaStoreRepositoryAdapterTest {

    @Mock
    private JpaStoreRepository repository;

    @InjectMocks
    private JpaStoreRepositoryAdapter adapter;

    @Test
    void shouldSaveStore() {

        UUID id = UUID.randomUUID();

        Store store = Store.builder()
                .id(id)
                .userId(UUID.randomUUID())
                .nombre("Mi Tienda")
                .status(StoreStatus.ACTIVE)
                .build();

        StoreEntity entity = StoreEntity.builder()
                .id(id)
                .userId(store.getUserId())
                .nombre("Mi Tienda")
                .status(StoreStatus.ACTIVE)
                .build();

        when(repository.save(any(StoreEntity.class)))
                .thenReturn(entity);

        Store result = adapter.save(store);

        assertNotNull(result);
        assertEquals(id, result.getId());
    }

    @Test
    void shouldFindById() {

        UUID id = UUID.randomUUID();

        StoreEntity entity = StoreEntity.builder()
                .id(id)
                .nombre("Store")
                .status(StoreStatus.ACTIVE)
                .build();

        when(repository.findById(id))
                .thenReturn(Optional.of(entity));

        assertTrue(adapter.findById(id).isPresent());
    }

    @Test
    void shouldFindByUserId() {

        UUID userId = UUID.randomUUID();

        StoreEntity entity = StoreEntity.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .build();

        when(repository.findByUserId(userId))
                .thenReturn(Optional.of(entity));

        assertTrue(adapter.findByUserId(userId).isPresent());
    }

    @Test
    void shouldExistsByUserId() {

        UUID userId = UUID.randomUUID();

        when(repository.existsByUserId(userId))
                .thenReturn(true);

        assertTrue(adapter.existsByUserId(userId));
    }
}