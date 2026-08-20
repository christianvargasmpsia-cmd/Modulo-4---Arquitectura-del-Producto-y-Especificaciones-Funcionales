package bo.umss.market.umss_market_api.infrastructure.controllers;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    /**
     * Crear publicación.
     *
     * El CreatePublicationUseCase genera automáticamente
     * el embedding de la publicación antes de guardarla.
     */
    @PostMapping
    public ResponseEntity<CreatePublicationResponse> createPublication(
            @RequestBody CreatePublicationRequest request) {

        CreatePublicationResponse response =
                createPublicationUseCase.execute(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * Buscar publicaciones.
     */
    @GetMapping
    public ResponseEntity<List<PublicationSummaryResponse>> search(
            @ModelAttribute CatalogFilterRequest filter) {

        List<PublicationSummaryResponse> publications =
                searchCatalogUseCase.execute(filter);

        return ResponseEntity.ok(publications);
    }

    /**
     * Obtener publicación por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Publication> findById(
            @PathVariable UUID id) {

        Publication publication =
                getPublicationByIdUseCase.execute(id);

        return ResponseEntity.ok(publication);
    }
}