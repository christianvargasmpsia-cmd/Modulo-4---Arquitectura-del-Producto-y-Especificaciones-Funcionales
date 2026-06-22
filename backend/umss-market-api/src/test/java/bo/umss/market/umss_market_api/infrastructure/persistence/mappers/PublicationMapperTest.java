package bo.umss.market.umss_market_api.infrastructure.persistence.mappers;

import static org.junit.jupiter.api.Assertions.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import bo.umss.market.umss_market_api.domain.enums.PaymentMode;
import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.infrastructure.persistence.entities.PublicationEntity;

class PublicationMapperTest {

    @Test
    void shouldMapDomainToEntity() {

        Publication publication = Publication.builder()
                .id(UUID.randomUUID())
                .storeId(UUID.randomUUID())
                .nombre("Brownie")
                .descripcion("Brownie artesanal")
                .precio(BigDecimal.valueOf(10))
                .tipo(PublicationType.PRODUCTO)
                .stock(10)
                .modalidadCobro(PaymentMode.ANTICIPADO)
                .activa(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        PublicationEntity entity =
                PublicationMapper.toEntity(publication);

        assertNotNull(entity);
        assertEquals(publication.getId(), entity.getId());
        assertEquals(publication.getNombre(), entity.getNombre());
        assertEquals(publication.getPrecio(), entity.getPrecio());
    }

    @Test
    void shouldMapEntityToDomain() {

        PublicationEntity entity = PublicationEntity.builder()
                .id(UUID.randomUUID())
                .storeId(UUID.randomUUID())
                .nombre("Brownie")
                .descripcion("Brownie artesanal")
                .precio(BigDecimal.valueOf(10))
                .tipo(PublicationType.PRODUCTO)
                .stock(10)
                .modalidadCobro(PaymentMode.ANTICIPADO)
                .activa(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        Publication publication =
                PublicationMapper.toDomain(entity);

        assertNotNull(publication);
        assertEquals(entity.getId(), publication.getId());
        assertEquals(entity.getNombre(), publication.getNombre());
        assertEquals(entity.getPrecio(), publication.getPrecio());
    }
}