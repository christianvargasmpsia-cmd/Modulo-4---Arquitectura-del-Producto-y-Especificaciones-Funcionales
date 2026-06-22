package bo.umss.market.umss_market_api.infrastructure.controllers;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import bo.umss.market.umss_market_api.application.dto.StorePublicProfileResponse;
import bo.umss.market.umss_market_api.application.usecases.GetStorePublicProfileUseCase;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tiendas")
@RequiredArgsConstructor
public class StoreController {

    private final GetStorePublicProfileUseCase getStorePublicProfileUseCase;

    @GetMapping("/{id}")
    public ResponseEntity<StorePublicProfileResponse> getPublicProfile(
            @PathVariable UUID id) {

        return ResponseEntity.ok(getStorePublicProfileUseCase.execute(id));
    }
}
