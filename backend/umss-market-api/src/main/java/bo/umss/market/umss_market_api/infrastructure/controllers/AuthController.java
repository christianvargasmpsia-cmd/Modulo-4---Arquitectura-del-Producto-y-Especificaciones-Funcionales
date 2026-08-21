package bo.umss.market.umss_market_api.infrastructure.controllers;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
import bo.umss.market.umss_market_api.infrastructure.security.TokenBlacklistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegisterEntrepreneurUseCase registerEntrepreneurUseCase;

    private final RegisterCustomerUseCase registerCustomerUseCase;

    private final RegisterAdminUseCase registerAdminUseCase;

    private final LoginUseCase loginUseCase;

    private final GetAuthenticatedUserUseCase getAuthenticatedUserUseCase;

    private final TokenBlacklistService tokenBlacklistService;

    /**
     * POST /api/auth/register/entrepreneur
     *
     * Registra un emprendedor y crea su tienda.
     */
    @PostMapping("/register/entrepreneur")
    public ResponseEntity<RegisterEntrepreneurResponse> registerEntrepreneur(
            @Valid @RequestBody RegisterEntrepreneurRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        registerEntrepreneurUseCase.execute(request)
                );
    }

    /**
     * POST /api/auth/register/customer
     *
     * Registra un comprador.
     */
    @PostMapping("/register/customer")
    public ResponseEntity<RegisterCustomerResponse> registerCustomer(
            @Valid @RequestBody RegisterCustomerRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        registerCustomerUseCase.execute(request)
                );
    }

    /**
     * POST /api/auth/register/admin
     *
     * Registra un administrador.
     */
    @PostMapping("/register/admin")
    public ResponseEntity<RegisterAdminResponse> registerAdmin(
            @Valid @RequestBody RegisterAdminRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        registerAdminUseCase.execute(request)
                );
    }

    /**
     * POST /api/auth/login
     *
     * Autentica al usuario y genera JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        return ResponseEntity.ok(
                loginUseCase.execute(request)
        );
    }

    /**
     * GET /api/auth/me
     *
     * Obtiene el usuario autenticado.
     */
    @GetMapping("/me")
    public ResponseEntity<UserSummaryResponse> me(
            Authentication authentication) {

        UUID userId =
                (UUID) authentication.getPrincipal();

        return ResponseEntity.ok(
                getAuthenticatedUserUseCase.execute(userId)
        );
    }

    /**
     * POST /api/auth/logout
     *
     * Invalida el JWT actual.
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @RequestHeader(
                    value = "Authorization",
                    required = false)
            String authorizationHeader) {

        if (authorizationHeader != null &&
                authorizationHeader.startsWith("Bearer ")) {

            String token =
                    authorizationHeader.substring(7);

            tokenBlacklistService.blacklist(token);
        }

        return ResponseEntity.noContent().build();
    }
}