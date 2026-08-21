package bo.umss.market.umss_market_api.infrastructure.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import bo.umss.market.umss_market_api.application.dto.CreateStoreRequest;
import bo.umss.market.umss_market_api.application.dto.CreateStoreResponse;
import bo.umss.market.umss_market_api.application.dto.PatchStoreRequest;
import bo.umss.market.umss_market_api.application.dto.StorePublicProfileResponse;
import bo.umss.market.umss_market_api.application.dto.StoreSummaryResponse;
import bo.umss.market.umss_market_api.application.dto.UpdateStoreRequest;
import bo.umss.market.umss_market_api.application.usecases.CreateStoreUseCase;
import bo.umss.market.umss_market_api.application.usecases.DeleteStoreUseCase;
import bo.umss.market.umss_market_api.application.usecases.GetStorePublicProfileUseCase;
import bo.umss.market.umss_market_api.application.usecases.GetStoresUseCase;
import bo.umss.market.umss_market_api.application.usecases.PatchStoreUseCase;
import bo.umss.market.umss_market_api.application.usecases.UpdateStoreUseCase;
import bo.umss.market.umss_market_api.domain.model.Store;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final GetStoresUseCase getStoresUseCase;

    private final GetStorePublicProfileUseCase getStorePublicProfileUseCase;

    private final CreateStoreUseCase createStoreUseCase;

    private final UpdateStoreUseCase updateStoreUseCase;

    private final PatchStoreUseCase patchStoreUseCase;

    private final DeleteStoreUseCase deleteStoreUseCase;

    /**
     * Obtener todas las tiendas.
     */
    @GetMapping
    public ResponseEntity<List<StoreSummaryResponse>> getAllStores() {

        return ResponseEntity.ok(
                getStoresUseCase.execute()
        );
    }

    /**
     * Obtener una tienda por ID.
     * Incluye su perfil público y publicaciones.
     */
    @GetMapping("/{id}")
    public ResponseEntity<StorePublicProfileResponse> getPublicProfile(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                getStorePublicProfileUseCase.execute(id)
        );
    }

    /**
     * Crear una tienda.
     */
    @PostMapping
    public ResponseEntity<CreateStoreResponse> createStore(
            @RequestBody CreateStoreRequest request) {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createStoreUseCase.execute(request));
    }

    /**
     * Actualizar completamente una tienda.
     */
    @PutMapping("/{id}")
    public ResponseEntity<StoreSummaryResponse> updateStore(
            @PathVariable UUID id,
            @RequestBody UpdateStoreRequest request) {

        Store store = updateStoreUseCase.execute(id, request);

        return ResponseEntity.ok(
                toResponse(store)
        );
    }

    /**
     * Actualizar parcialmente una tienda.
     */
    @PatchMapping("/{id}")
    public ResponseEntity<StoreSummaryResponse> patchStore(
            @PathVariable UUID id,
            @RequestBody PatchStoreRequest request) {

        Store store = patchStoreUseCase.execute(id, request);

        return ResponseEntity.ok(
                toResponse(store)
        );
    }

    /**
     * Eliminar una tienda.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStore(
            @PathVariable UUID id) {

        deleteStoreUseCase.execute(id);

        return ResponseEntity.noContent().build();
    }

    /**
     * Convertir el modelo de dominio a respuesta.
     */
    private StoreSummaryResponse toResponse(Store store) {

        return StoreSummaryResponse.builder()
                .id(store.getId())
                .userId(store.getUserId())
                .nombre(store.getNombre())
                .descripcion(store.getDescripcion())
                .categoria(store.getCategoria())
                .telefonoContacto(store.getTelefonoContacto())
                .emailContacto(store.getEmailContacto())
                .status(store.getStatus())
                .createdAt(store.getCreatedAt())
                .updatedAt(store.getUpdatedAt())
                .build();
    }
}