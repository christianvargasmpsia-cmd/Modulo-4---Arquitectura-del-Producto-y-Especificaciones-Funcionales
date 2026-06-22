package bo.umss.market.umss_market_api.infrastructure.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.UUID;

import org.junit.jupiter.api.Test;

import bo.umss.market.umss_market_api.application.dto.RegisterEntrepreneurRequest;
import bo.umss.market.umss_market_api.application.dto.RegisterEntrepreneurResponse;
import bo.umss.market.umss_market_api.application.usecases.RegisterEntrepreneurUseCase;

class AuthControllerTest {

    @Test
    void shouldRegisterEntrepreneur() {

        RegisterEntrepreneurUseCase useCase =
                mock(RegisterEntrepreneurUseCase.class);

        AuthController controller =
                new AuthController(useCase);

        RegisterEntrepreneurRequest request =
                new RegisterEntrepreneurRequest();

        RegisterEntrepreneurResponse response =
                RegisterEntrepreneurResponse.builder()
                        .success(true)
                        .message("OK")
                        .usuarioId(UUID.randomUUID())
                        .tiendaId(UUID.randomUUID())
                        .build();

        when(useCase.execute(any()))
                .thenReturn(response);

        var result = controller.register(request);

        assertEquals(201, result.getStatusCode().value());
        assertTrue(result.getBody().isSuccess());
    }
}