package bo.umss.market.umss_market_api.infrastructure.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import bo.umss.market.umss_market_api.application.dto.UpdateUserRequest;
import bo.umss.market.umss_market_api.application.dto.UpdateUserStatusRequest;
import bo.umss.market.umss_market_api.application.dto.UserSummaryResponse;
import bo.umss.market.umss_market_api.application.usecases.DeleteUserUseCase;
import bo.umss.market.umss_market_api.application.usecases.GetUserByIdUseCase;
import bo.umss.market.umss_market_api.application.usecases.GetUsersUseCase;
import bo.umss.market.umss_market_api.application.usecases.UpdateUserStatusUseCase;
import bo.umss.market.umss_market_api.application.usecases.UpdateUserUseCase;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final GetUsersUseCase getUsersUseCase;

    private final GetUserByIdUseCase getUserByIdUseCase;

    private final UpdateUserUseCase updateUserUseCase;

    private final UpdateUserStatusUseCase updateUserStatusUseCase;

    private final DeleteUserUseCase deleteUserUseCase;

    /**
     * GET /api/users
     *
     * Obtener todos los usuarios.
     */
    @GetMapping
    public ResponseEntity<List<UserSummaryResponse>> getAllUsers() {

        return ResponseEntity.ok(
                getUsersUseCase.execute()
        );
    }

    /**
     * GET /api/users/{id}
     *
     * Obtener un usuario por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserSummaryResponse> getUserById(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                getUserByIdUseCase.execute(id)
        );
    }

    /**
     * PUT /api/users/{id}
     *
     * Actualizar completamente un usuario.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UserSummaryResponse> updateUser(
            @PathVariable UUID id,
            @RequestBody UpdateUserRequest request) {

        return ResponseEntity.ok(
                updateUserUseCase.execute(id, request)
        );
    }

    /**
     * PATCH /api/users/{id}/status
     *
     * Activar o desactivar un usuario.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<UserSummaryResponse> updateUserStatus(
            @PathVariable UUID id,
            @RequestBody UpdateUserStatusRequest request) {

        return ResponseEntity.ok(
                updateUserStatusUseCase.execute(id, request)
        );
    }

    /**
     * DELETE /api/users/{id}
     *
     * Eliminar usuario.
     *
     * ADMIN:
     *     elimina solamente el usuario.
     *
     * COMPRADOR:
     *     elimina solamente el usuario.
     *
     * EMPRENDEDOR:
     *     elimina la tienda y posteriormente el usuario.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable UUID id) {

        deleteUserUseCase.execute(id);

        return ResponseEntity.noContent().build();
    }
}