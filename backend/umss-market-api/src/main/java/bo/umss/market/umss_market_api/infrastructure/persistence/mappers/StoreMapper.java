package bo.umss.market.umss_market_api.infrastructure.persistence.mappers;

import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.infrastructure.persistence.entities.StoreEntity;

public class StoreMapper {

    public static Store toDomain(StoreEntity entity) {

        if (entity == null) {
            return null;
        }

        return Store.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .categoria(entity.getCategoria())
                .telefonoContacto(entity.getTelefonoContacto())
                .emailContacto(entity.getEmailContacto())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static StoreEntity toEntity(Store domain) {

        if (domain == null) {
            return null;
        }

        return StoreEntity.builder()
                .id(domain.getId())
                .userId(domain.getUserId())
                .nombre(domain.getNombre())
                .descripcion(domain.getDescripcion())
                .categoria(domain.getCategoria())
                .telefonoContacto(domain.getTelefonoContacto())
                .emailContacto(domain.getEmailContacto())
                .status(domain.getStatus())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}
