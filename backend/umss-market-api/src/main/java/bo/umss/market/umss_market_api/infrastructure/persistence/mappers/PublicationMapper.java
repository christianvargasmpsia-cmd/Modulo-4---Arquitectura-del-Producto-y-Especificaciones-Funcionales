package bo.umss.market.umss_market_api.infrastructure.persistence.mappers;

import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.infrastructure.persistence.entities.PublicationEntity;

public class PublicationMapper {

    private PublicationMapper() {
    }

    public static PublicationEntity toEntity(Publication publication) {

        return PublicationEntity.builder()
                .id(publication.getId())
                .storeId(publication.getStoreId())
                .nombre(publication.getNombre())
                .descripcion(publication.getDescripcion())
                .precio(publication.getPrecio())
                .tipo(publication.getTipo())
                .stock(publication.getStock())
                .modalidadCobro(publication.getModalidadCobro())
                .activa(publication.getActiva())
                .createdAt(publication.getCreatedAt())
                .updatedAt(publication.getUpdatedAt())
                .build();
    }

    public static Publication toDomain(PublicationEntity entity) {

        return Publication.builder()
                .id(entity.getId())
                .storeId(entity.getStoreId())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .precio(entity.getPrecio())
                .tipo(entity.getTipo())
                .stock(entity.getStock())
                .modalidadCobro(entity.getModalidadCobro())
                .activa(entity.getActiva())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}