package bo.umss.market.umss_market_api.infrastructure.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import bo.umss.market.umss_market_api.application.usecases.GetEmbeddingStatusUseCase;
import bo.umss.market.umss_market_api.application.usecases.ReindexPublicationEmbeddingsUseCase;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/embeddings")
@RequiredArgsConstructor
public class EmbeddingAdminController {

    private final GetEmbeddingStatusUseCase getEmbeddingStatusUseCase;

    private final ReindexPublicationEmbeddingsUseCase reindexPublicationEmbeddingsUseCase;

    @GetMapping("/status")
    public ResponseEntity<GetEmbeddingStatusUseCase.EmbeddingStatus> status() {

        return ResponseEntity.ok(
                getEmbeddingStatusUseCase.execute()
        );
    }

    @PostMapping("/reindex")
    public ResponseEntity<ReindexPublicationEmbeddingsUseCase.ReindexResult> reindex() {

        return ResponseEntity.ok(
                reindexPublicationEmbeddingsUseCase.execute()
        );
    }
}

