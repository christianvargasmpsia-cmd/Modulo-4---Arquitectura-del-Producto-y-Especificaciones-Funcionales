package bo.umss.market.umss_market_api.infrastructure.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import bo.umss.market.umss_market_api.application.dto.RegisterEntrepreneurRequest;
import bo.umss.market.umss_market_api.application.dto.RegisterEntrepreneurResponse;
import bo.umss.market.umss_market_api.application.usecases.RegisterEntrepreneurUseCase;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final RegisterEntrepreneurUseCase registerEntrepreneurUseCase;

    @PostMapping("/register")
    public ResponseEntity<RegisterEntrepreneurResponse> register(
            @Valid @RequestBody RegisterEntrepreneurRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(registerEntrepreneurUseCase.execute(request));
    }
}