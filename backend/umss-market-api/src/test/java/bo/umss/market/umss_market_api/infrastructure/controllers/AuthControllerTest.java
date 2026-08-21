package bo.umss.market.umss_market_api.infrastructure.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;

import bo.umss.market.umss_market_api.application.dto.LoginRequest;
import bo.umss.market.umss_market_api.application.dto.LoginResponse;
import bo.umss.market.umss_market_api.application.dto.RegisterAdminRequest;
import bo.umss.market.umss_market_api.application.dto.RegisterAdminResponse;
import bo.umss.market.umss_market_api.application.dto.RegisterCustomerRequest;
import bo.umss.market.umss_market_api.application.dto.RegisterCustomerResponse;
import bo.umss.market.umss_market_api.application.dto.RegisterEntrepreneurRequest;
import bo.umss.market.umss_market_api.application.dto.RegisterEntrepreneurResponse;
import bo.umss.market.umss_market_api.application.dto.UserSummaryResponse;

import bo.umss.market.umss_market_api.application.usecases.GetAuthenticatedUserUseCase;
import bo.umss.market.umss_market_api.application.usecases.LoginUseCase;
import bo.umss.market.umss_market_api.application.usecases.RegisterAdminUseCase;
import bo.umss.market.umss_market_api.application.usecases.RegisterCustomerUseCase;
import bo.umss.market.umss_market_api.application.usecases.RegisterEntrepreneurUseCase;

import bo.umss.market.umss_market_api.domain.enums.Role;
import bo.umss.market.umss_market_api.domain.enums.UserStatus;

import bo.umss.market.umss_market_api.infrastructure.security.TokenBlacklistService;


class AuthControllerTest {

    @Test
    void shouldRegisterEntrepreneur() {

        RegisterEntrepreneurUseCase entrepreneurUseCase =
                mock(RegisterEntrepreneurUseCase.class);

        RegisterCustomerUseCase customerUseCase =
                mock(RegisterCustomerUseCase.class);

        RegisterAdminUseCase adminUseCase =
                mock(RegisterAdminUseCase.class);

        LoginUseCase loginUseCase =
                mock(LoginUseCase.class);

        GetAuthenticatedUserUseCase getAuthenticatedUserUseCase =
                mock(GetAuthenticatedUserUseCase.class);

        TokenBlacklistService tokenBlacklistService =
                mock(TokenBlacklistService.class);

        AuthController controller =
                new AuthController(
                        entrepreneurUseCase,
                        customerUseCase,
                        adminUseCase,
                        loginUseCase,
                        getAuthenticatedUserUseCase,
                        tokenBlacklistService);

        RegisterEntrepreneurRequest request =
                new RegisterEntrepreneurRequest();

        RegisterEntrepreneurResponse response =
                RegisterEntrepreneurResponse.builder()
                        .success(true)
                        .message("Emprendedor registrado correctamente")
                        .usuarioId(UUID.randomUUID())
                        .tiendaId(UUID.randomUUID())
                        .build();

        when(entrepreneurUseCase.execute(any()))
                .thenReturn(response);

        var result =
                controller.registerEntrepreneur(request);

        assertEquals(
                201,
                result.getStatusCode().value());

        assertNotNull(result.getBody());

        assertTrue(
                result.getBody().isSuccess());

        verify(entrepreneurUseCase)
                .execute(request);
    }


    @Test
    void shouldRegisterCustomer() {

        RegisterEntrepreneurUseCase entrepreneurUseCase =
                mock(RegisterEntrepreneurUseCase.class);

        RegisterCustomerUseCase customerUseCase =
                mock(RegisterCustomerUseCase.class);

        RegisterAdminUseCase adminUseCase =
                mock(RegisterAdminUseCase.class);

        LoginUseCase loginUseCase =
                mock(LoginUseCase.class);

        GetAuthenticatedUserUseCase getAuthenticatedUserUseCase =
                mock(GetAuthenticatedUserUseCase.class);

        TokenBlacklistService tokenBlacklistService =
                mock(TokenBlacklistService.class);

        AuthController controller =
                new AuthController(
                        entrepreneurUseCase,
                        customerUseCase,
                        adminUseCase,
                        loginUseCase,
                        getAuthenticatedUserUseCase,
                        tokenBlacklistService);

        RegisterCustomerRequest request =
                new RegisterCustomerRequest();

        RegisterCustomerResponse response =
                RegisterCustomerResponse.builder()
                        .success(true)
                        .message("Comprador registrado correctamente")
                        .usuarioId(UUID.randomUUID())
                        .build();

        when(customerUseCase.execute(any()))
                .thenReturn(response);

        var result =
                controller.registerCustomer(request);

        assertEquals(
                201,
                result.getStatusCode().value());

        assertNotNull(result.getBody());

        assertTrue(
                result.getBody().isSuccess());

        verify(customerUseCase)
                .execute(request);
    }


    @Test
    void shouldRegisterAdmin() {

        RegisterEntrepreneurUseCase entrepreneurUseCase =
                mock(RegisterEntrepreneurUseCase.class);

        RegisterCustomerUseCase customerUseCase =
                mock(RegisterCustomerUseCase.class);

        RegisterAdminUseCase adminUseCase =
                mock(RegisterAdminUseCase.class);

        LoginUseCase loginUseCase =
                mock(LoginUseCase.class);

        GetAuthenticatedUserUseCase getAuthenticatedUserUseCase =
                mock(GetAuthenticatedUserUseCase.class);

        TokenBlacklistService tokenBlacklistService =
                mock(TokenBlacklistService.class);

        AuthController controller =
                new AuthController(
                        entrepreneurUseCase,
                        customerUseCase,
                        adminUseCase,
                        loginUseCase,
                        getAuthenticatedUserUseCase,
                        tokenBlacklistService);

        RegisterAdminRequest request =
                new RegisterAdminRequest();

        RegisterAdminResponse response =
                RegisterAdminResponse.builder()
                        .success(true)
                        .message("Administrador registrado correctamente")
                        .usuarioId(UUID.randomUUID())
                        .build();

        when(adminUseCase.execute(any()))
                .thenReturn(response);

        var result =
                controller.registerAdmin(request);

        assertEquals(
                201,
                result.getStatusCode().value());

        assertNotNull(result.getBody());

        assertTrue(
                result.getBody().isSuccess());

        verify(adminUseCase)
                .execute(request);
    }


    @Test
    void shouldLoginSuccessfully() {

        RegisterEntrepreneurUseCase entrepreneurUseCase =
                mock(RegisterEntrepreneurUseCase.class);

        RegisterCustomerUseCase customerUseCase =
                mock(RegisterCustomerUseCase.class);

        RegisterAdminUseCase adminUseCase =
                mock(RegisterAdminUseCase.class);

        LoginUseCase loginUseCase =
                mock(LoginUseCase.class);

        GetAuthenticatedUserUseCase getAuthenticatedUserUseCase =
                mock(GetAuthenticatedUserUseCase.class);

        TokenBlacklistService tokenBlacklistService =
                mock(TokenBlacklistService.class);

        AuthController controller =
                new AuthController(
                        entrepreneurUseCase,
                        customerUseCase,
                        adminUseCase,
                        loginUseCase,
                        getAuthenticatedUserUseCase,
                        tokenBlacklistService);

        LoginRequest request =
                new LoginRequest();

        request.setEmail(
                "roberto.gomez@umss.edu.bo");

        request.setPassword(
                "12345678");

        UUID userId =
                UUID.randomUUID();

        LoginResponse response =
                LoginResponse.builder()
                        .token("jwt-token-test")
                        .userId(userId)
                        .email("roberto.gomez@umss.edu.bo")
                        .role("EMPRENDEDOR")
                        .build();

        when(loginUseCase.execute(any()))
                .thenReturn(response);

        var result =
                controller.login(request);

        assertEquals(
                200,
                result.getStatusCode().value());

        assertNotNull(
                result.getBody());

        assertEquals(
                "jwt-token-test",
                result.getBody().getToken());

        assertEquals(
                userId,
                result.getBody().getUserId());

        assertEquals(
                "roberto.gomez@umss.edu.bo",
                result.getBody().getEmail());

        assertEquals(
                "EMPRENDEDOR",
                result.getBody().getRole());

        verify(loginUseCase)
                .execute(request);
    }


    @Test
    void shouldGetAuthenticatedUser() {

        RegisterEntrepreneurUseCase entrepreneurUseCase =
                mock(RegisterEntrepreneurUseCase.class);

        RegisterCustomerUseCase customerUseCase =
                mock(RegisterCustomerUseCase.class);

        RegisterAdminUseCase adminUseCase =
                mock(RegisterAdminUseCase.class);

        LoginUseCase loginUseCase =
                mock(LoginUseCase.class);

        GetAuthenticatedUserUseCase getAuthenticatedUserUseCase =
                mock(GetAuthenticatedUserUseCase.class);

        TokenBlacklistService tokenBlacklistService =
                mock(TokenBlacklistService.class);

        AuthController controller =
                new AuthController(
                        entrepreneurUseCase,
                        customerUseCase,
                        adminUseCase,
                        loginUseCase,
                        getAuthenticatedUserUseCase,
                        tokenBlacklistService);

        UUID userId =
                UUID.randomUUID();

        UserSummaryResponse response =
                UserSummaryResponse.builder()
                        .id(userId)
                        .ru("202091567")
                        .nombre("Sergio")
                        .apellidoPaterno("Vargas")
                        .apellidoMaterno("Torrez")
                        .email("sergio.vargas@umss.edu.bo")
                        .celular("70345678")
                        .facultad("Ciencias Juridicas")
                        .role(Role.ADMIN)
                        .status(UserStatus.ACTIVE)
                        .build();

        when(getAuthenticatedUserUseCase.execute(userId))
                .thenReturn(response);

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        userId,
                        null);

        var result =
                controller.me(authentication);

        assertEquals(
                200,
                result.getStatusCode().value());

        assertNotNull(
                result.getBody());

        assertEquals(
                userId,
                result.getBody().getId());

        assertEquals(
                "202091567",
                result.getBody().getRu());

        assertEquals(
                "Sergio",
                result.getBody().getNombre());

        assertEquals(
                "sergio.vargas@umss.edu.bo",
                result.getBody().getEmail());

        assertEquals(
                Role.ADMIN,
                result.getBody().getRole());

        verify(getAuthenticatedUserUseCase)
                .execute(userId);
    }
}
