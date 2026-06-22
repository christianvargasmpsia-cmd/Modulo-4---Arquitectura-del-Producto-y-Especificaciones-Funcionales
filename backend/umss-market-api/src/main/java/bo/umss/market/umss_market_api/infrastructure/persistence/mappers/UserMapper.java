package bo.umss.market.umss_market_api.infrastructure.persistence.mappers;

import bo.umss.market.umss_market_api.domain.model.User;
import bo.umss.market.umss_market_api.infrastructure.persistence.entities.UserEntity;

public class UserMapper {

    public static User toDomain(UserEntity entity) {

        if (entity == null) {
            return null;
        }

        return User.builder()
                .id(entity.getId())
                .ru(entity.getRu())
                .nombre(entity.getNombre())
                .apellidoPaterno(entity.getApellidoPaterno())
                .apellidoMaterno(entity.getApellidoMaterno())
                .email(entity.getEmail())
                .celular(entity.getCelular())
                .facultad(entity.getFacultad())
                .passwordHash(entity.getPasswordHash())
                .role(entity.getRole())
                .status(entity.getStatus())
                .ultimoLogin(entity.getUltimoLogin())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static UserEntity toEntity(User domain) {

        if (domain == null) {
            return null;
        }

        return UserEntity.builder()
                .id(domain.getId())
                .ru(domain.getRu())
                .nombre(domain.getNombre())
                .apellidoPaterno(domain.getApellidoPaterno())
                .apellidoMaterno(domain.getApellidoMaterno())
                .email(domain.getEmail())
                .celular(domain.getCelular())
                .facultad(domain.getFacultad())
                .passwordHash(domain.getPasswordHash())
                .role(domain.getRole())
                .status(domain.getStatus())
                .ultimoLogin(domain.getUltimoLogin())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}
