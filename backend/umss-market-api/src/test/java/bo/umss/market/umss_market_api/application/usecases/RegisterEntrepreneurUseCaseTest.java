package bo.umss.market.umss_market_api.application.usecases;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import bo.umss.market.umss_market_api.application.dto.RegisterEntrepreneurRequest;
import bo.umss.market.umss_market_api.application.dto.RegisterEntrepreneurResponse;
import bo.umss.market.umss_market_api.domain.exceptions.EmailAlreadyExistsException;
import bo.umss.market.umss_market_api.domain.exceptions.UserAlreadyExistsException;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.model.User;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.UserRepositoryPort;

class RegisterEntrepreneurUseCaseTest {

    private UserRepositoryPort userRepository;
    private StoreRepositoryPort storeRepository;
    private PasswordEncoder passwordEncoder;

    private RegisterEntrepreneurUseCase useCase;

    @BeforeEach
    void setUp() {

        userRepository = mock(UserRepositoryPort.class);
        storeRepository = mock(StoreRepositoryPort.class);
        passwordEncoder = mock(PasswordEncoder.class);

        useCase = new RegisterEntrepreneurUseCase(
                userRepository,
                storeRepository,
                passwordEncoder
        );
    }

    @Test
    void shouldRegisterEntrepreneurSuccessfully() {

        RegisterEntrepreneurRequest request =
                new RegisterEntrepreneurRequest();

        request.setRu("202000231");
        request.setNombre("Melani");
        request.setApellidoPaterno("Rodriguez");
        request.setApellidoMaterno("Gonzales");
        request.setEmail("melani@umss.edu.bo");
        request.setCelular("70707070");
        request.setFacultad("FCYT");
        request.setPassword("123456");
        request.setNombreTienda("Melani Store");

        UUID userId = UUID.randomUUID();
        UUID storeId = UUID.randomUUID();

        when(userRepository.existsByRu(anyString()))
                .thenReturn(false);

        when(userRepository.existsByEmail(anyString()))
                .thenReturn(false);

        when(passwordEncoder.encode(anyString()))
                .thenReturn("HASH");

        when(userRepository.save(any(User.class)))
                .thenReturn(
                        User.builder()
                                .id(userId)
                                .build()
                );

        when(storeRepository.existsByUserId(userId))
                .thenReturn(false);

        when(storeRepository.save(any(Store.class)))
                .thenReturn(
                        Store.builder()
                                .id(storeId)
                                .build()
                );

        RegisterEntrepreneurResponse response =
                useCase.execute(request);

        assertTrue(response.isSuccess());
        assertEquals(userId, response.getUsuarioId());
        assertEquals(storeId, response.getTiendaId());
    }

    @Test
    void shouldThrowWhenRuAlreadyExists() {

        RegisterEntrepreneurRequest request =
                new RegisterEntrepreneurRequest();

        request.setRu("202000231");

        when(userRepository.existsByRu(anyString()))
                .thenReturn(true);

        assertThrows(
                UserAlreadyExistsException.class,
                () -> useCase.execute(request)
        );
    }

    @Test
    void shouldThrowWhenEmailAlreadyExists() {

        RegisterEntrepreneurRequest request =
                new RegisterEntrepreneurRequest();

        request.setRu("202000231");
        request.setEmail("test@umss.edu.bo");

        when(userRepository.existsByRu(anyString()))
                .thenReturn(false);

        when(userRepository.existsByEmail(anyString()))
                .thenReturn(true);

        assertThrows(
                EmailAlreadyExistsException.class,
                () -> useCase.execute(request)
        );
    }
}