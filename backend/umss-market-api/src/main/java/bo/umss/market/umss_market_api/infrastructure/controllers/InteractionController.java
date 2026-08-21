package bo.umss.market.umss_market_api.infrastructure.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import bo.umss.market.umss_market_api.application.dto.CreateInteractionRequest;
import bo.umss.market.umss_market_api.application.dto.InteractionResponse;
import bo.umss.market.umss_market_api.application.usecases.CreateInteractionUseCase;
import bo.umss.market.umss_market_api.application.usecases.DeleteInteractionUseCase;
import bo.umss.market.umss_market_api.application.usecases.GetInteractionByIdUseCase;
import bo.umss.market.umss_market_api.application.usecases.GetUserInteractionsUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/interactions")
@RequiredArgsConstructor
public class InteractionController {

    private final CreateInteractionUseCase createInteractionUseCase;

    private final GetUserInteractionsUseCase getUserInteractionsUseCase;

    private final GetInteractionByIdUseCase getInteractionByIdUseCase;

    private final DeleteInteractionUseCase deleteInteractionUseCase;

    /**
     * Crear una interacción para el usuario autenticado.
     */
    @PostMapping
    public ResponseEntity<InteractionResponse> create(
            @Valid @RequestBody CreateInteractionRequest request,
            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        InteractionResponse response =
                createInteractionUseCase.execute(
                        userId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * Obtener todas las interacciones
     * del usuario autenticado.
     */
    @GetMapping
    public ResponseEntity<List<InteractionResponse>> findAll(
            Authentication authentication) {

        UUID userId = getAuthenticatedUserId(authentication);

        List<InteractionResponse> response =
                getUserInteractionsUseCase.execute(userId);

        return ResponseEntity.ok(response);
    }

    /**
     * Obtener una interacción por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<InteractionResponse> findById(
            @PathVariable UUID id) {

        InteractionResponse response =
                getInteractionByIdUseCase.execute(id);

        return ResponseEntity.ok(response);
    }

    /**
     * Eliminar una interacción.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id) {

        deleteInteractionUseCase.execute(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    /**
     * Obtiene el UUID del usuario autenticado
     * desde el JWT.
     */
    private UUID getAuthenticatedUserId(
            Authentication authentication) {

        if (authentication == null
                || authentication.getPrincipal() == null) {

            throw new RuntimeException(
                    "Usuario no autenticado"
            );
        }

        Object principal =
                authentication.getPrincipal();

        if (principal instanceof UUID userId) {
            return userId;
        }

        return UUID.fromString(
                principal.toString()
        );
    }
}