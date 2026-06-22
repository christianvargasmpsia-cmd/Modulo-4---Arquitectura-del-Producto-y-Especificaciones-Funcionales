package bo.umss.market.umss_market_api.infrastructure.persistence.mappers;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import bo.umss.market.umss_market_api.domain.enums.StoreStatus;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.infrastructure.persistence.entities.StoreEntity;

class StoreMapperTest {

    @Test
    void shouldMapEntityToDomain() {

        StoreEntity entity = StoreEntity.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .nombre("Mi Tienda")
                .descripcion("Descripción")
                .categoria("Comida")
                .telefonoContacto("70707070")
                .emailContacto("tienda@umss.edu.bo")
                .status(StoreStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Store store = StoreMapper.toDomain(entity);

        assertNotNull(store);
        assertEquals(entity.getId(), store.getId());
        assertEquals(entity.getUserId(), store.getUserId());
        assertEquals(entity.getNombre(), store.getNombre());
        assertEquals(entity.getEmailContacto(), store.getEmailContacto());
    }

    @Test
    void shouldMapDomainToEntity() {

        Store store = Store.builder()
                .id(UUID.randomUUID())
                .userId(UUID.randomUUID())
                .nombre("Mi Tienda")
                .descripcion("Descripción")
                .categoria("Comida")
                .telefonoContacto("70707070")
                .emailContacto("tienda@umss.edu.bo")
                .status(StoreStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        StoreEntity entity = StoreMapper.toEntity(store);

        assertNotNull(entity);
        assertEquals(store.getId(), entity.getId());
        assertEquals(store.getUserId(), entity.getUserId());
        assertEquals(store.getNombre(), entity.getNombre());
        assertEquals(store.getEmailContacto(), entity.getEmailContacto());
    }

    @Test
    void shouldReturnNullWhenEntityIsNull() {
        assertNull(StoreMapper.toDomain(null));
    }

    @Test
    void shouldReturnNullWhenDomainIsNull() {
        assertNull(StoreMapper.toEntity(null));
    }
}