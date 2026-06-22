package bo.umss.market.umss_market_api.infrastructure.persistence.mappers;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import bo.umss.market.umss_market_api.domain.enums.Role;
import bo.umss.market.umss_market_api.domain.enums.UserStatus;
import bo.umss.market.umss_market_api.domain.model.User;
import bo.umss.market.umss_market_api.infrastructure.persistence.entities.UserEntity;

class UserMapperTest {

    @Test
    void shouldMapEntityToDomain() {

        UserEntity entity = UserEntity.builder()
                .id(UUID.randomUUID())
                .ru("202000001")
                .nombre("Juan")
                .apellidoPaterno("Perez")
                .apellidoMaterno("Lopez")
                .email("juan@umss.edu.bo")
                .celular("70707070")
                .facultad("FCYT")
                .passwordHash("123")
                .role(Role.EMPRENDEDOR)
                .status(UserStatus.ACTIVE)
                .ultimoLogin(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        User user = UserMapper.toDomain(entity);

        assertNotNull(user);
        assertEquals(entity.getId(), user.getId());
        assertEquals(entity.getRu(), user.getRu());
        assertEquals(entity.getNombre(), user.getNombre());
        assertEquals(entity.getEmail(), user.getEmail());
    }

    @Test
    void shouldMapDomainToEntity() {

        User user = User.builder()
                .id(UUID.randomUUID())
                .ru("202000001")
                .nombre("Juan")
                .apellidoPaterno("Perez")
                .apellidoMaterno("Lopez")
                .email("juan@umss.edu.bo")
                .celular("70707070")
                .facultad("FCYT")
                .passwordHash("123")
                .role(Role.EMPRENDEDOR)
                .status(UserStatus.ACTIVE)
                .ultimoLogin(LocalDateTime.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        UserEntity entity = UserMapper.toEntity(user);

        assertNotNull(entity);
        assertEquals(user.getId(), entity.getId());
        assertEquals(user.getRu(), entity.getRu());
        assertEquals(user.getNombre(), entity.getNombre());
        assertEquals(user.getEmail(), entity.getEmail());
    }

    @Test
    void shouldReturnNullWhenEntityIsNull() {
        assertNull(UserMapper.toDomain(null));
    }

    @Test
    void shouldReturnNullWhenDomainIsNull() {
        assertNull(UserMapper.toEntity(null));
    }
}