package bo.umss.market.umss_market_api.infrastructure.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import bo.umss.market.umss_market_api.application.dto.CatalogFilterRequest;
import bo.umss.market.umss_market_api.application.dto.CreatePublicationRequest;
import bo.umss.market.umss_market_api.application.dto.CreatePublicationResponse;
import bo.umss.market.umss_market_api.application.dto.PublicationSummaryResponse;
import bo.umss.market.umss_market_api.application.usecases.CreatePublicationUseCase;
import bo.umss.market.umss_market_api.application.usecases.GetPublicationByIdUseCase;
import bo.umss.market.umss_market_api.application.usecases.SearchCatalogUseCase;
import bo.umss.market.umss_market_api.domain.model.Publication;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/publications")
@RequiredArgsConstructor
public class PublicationController {

    private final CreatePublicationUseCase createPublicationUseCase;

    private final SearchCatalogUseCase searchCatalogUseCase;

    private final GetPublicationByIdUseCase getPublicationByIdUseCase;

    @PostMapping
    public ResponseEntity<CreatePublicationResponse> createPublication(
            @RequestBody CreatePublicationRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(createPublicationUseCase.execute(request));
    }

    @GetMapping
    public ResponseEntity<List<PublicationSummaryResponse>> search(
            @ModelAttribute CatalogFilterRequest filter) {

        return ResponseEntity.ok(searchCatalogUseCase.execute(filter));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Publication> findById(
            @PathVariable UUID id) {

        return ResponseEntity.ok(
                getPublicationByIdUseCase.execute(id));
    }
}