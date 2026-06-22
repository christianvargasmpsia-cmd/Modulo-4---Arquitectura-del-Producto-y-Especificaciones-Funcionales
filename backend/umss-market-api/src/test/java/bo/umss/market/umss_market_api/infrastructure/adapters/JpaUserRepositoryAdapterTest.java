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

import bo.umss.market.umss_market_api.domain.enums.Role;
import bo.umss.market.umss_market_api.domain.enums.UserStatus;
import bo.umss.market.umss_market_api.domain.model.User;
import bo.umss.market.umss_market_api.infrastructure.persistence.entities.UserEntity;
import bo.umss.market.umss_market_api.infrastructure.persistence.repositories.JpaUserRepository;

@ExtendWith(MockitoExtension.class)
class JpaUserRepositoryAdapterTest {

    @Mock
    private JpaUserRepository repository;

    @InjectMocks
    private JpaUserRepositoryAdapter adapter;

    @Test
    void shouldSaveUser() {

        UUID id = UUID.randomUUID();

        User user = User.builder()
                .id(id)
                .ru("202000001")
                .nombre("Juan")
                .role(Role.EMPRENDEDOR)
                .status(UserStatus.ACTIVE)
                .build();

        UserEntity entity = UserEntity.builder()
                .id(id)
                .ru("202000001")
                .nombre("Juan")
                .role(Role.EMPRENDEDOR)
                .status(UserStatus.ACTIVE)
                .build();

        when(repository.save(any(UserEntity.class)))
                .thenReturn(entity);

        User result = adapter.save(user);

        assertNotNull(result);
        assertEquals(id, result.getId());
    }

    @Test
    void shouldFindById() {

        UUID id = UUID.randomUUID();

        UserEntity entity = UserEntity.builder()
                .id(id)
                .ru("202000001")
                .nombre("Juan")
                .build();

        when(repository.findById(id))
                .thenReturn(Optional.of(entity));

        Optional<User> result = adapter.findById(id);

        assertTrue(result.isPresent());
    }

    @Test
    void shouldFindByRu() {

        UserEntity entity = UserEntity.builder()
                .id(UUID.randomUUID())
                .ru("202000001")
                .build();

        when(repository.findByRu("202000001"))
                .thenReturn(Optional.of(entity));

        Optional<User> result = adapter.findByRu("202000001");

        assertTrue(result.isPresent());
    }

    @Test
    void shouldFindByEmail() {

        UserEntity entity = UserEntity.builder()
                .id(UUID.randomUUID())
                .email("juan@umss.edu.bo")
                .build();

        when(repository.findByEmail("juan@umss.edu.bo"))
                .thenReturn(Optional.of(entity));

        Optional<User> result = adapter.findByEmail("juan@umss.edu.bo");

        assertTrue(result.isPresent());
    }

    @Test
    void shouldExistsByRu() {

        when(repository.existsByRu("202000001"))
                .thenReturn(true);

        assertTrue(adapter.existsByRu("202000001"));
    }

    @Test
    void shouldExistsByEmail() {

        when(repository.existsByEmail("juan@umss.edu.bo"))
                .thenReturn(true);

        assertTrue(adapter.existsByEmail("juan@umss.edu.bo"));
    }
}