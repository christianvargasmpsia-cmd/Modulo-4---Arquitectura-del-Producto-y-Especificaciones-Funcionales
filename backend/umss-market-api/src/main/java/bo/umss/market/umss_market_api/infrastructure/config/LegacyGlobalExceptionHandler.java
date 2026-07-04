package bo.umss.market.umss_market_api.infrastructure.config;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import bo.umss.market.umss_market_api.domain.exceptions.EmailAlreadyExistsException;
import bo.umss.market.umss_market_api.domain.exceptions.InvalidPriceRangeException;
import bo.umss.market.umss_market_api.domain.exceptions.PublicationNotFoundException;
import bo.umss.market.umss_market_api.domain.exceptions.StoreAlreadyExistsException;
import bo.umss.market.umss_market_api.domain.exceptions.StoreNotFoundException;
import bo.umss.market.umss_market_api.domain.exceptions.UserAlreadyExistsException;

@RestControllerAdvice
public class LegacyGlobalExceptionHandler {

    // ── 404 Not Found ────────────────────────────────────────────────────────

    @ExceptionHandler(StoreNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleStoreNotFound(
            StoreNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(error(ex.getMessage()));
    }

    @ExceptionHandler(PublicationNotFoundException.class)
    public ResponseEntity<Map<String, String>> handlePublicationNotFound(
            PublicationNotFoundException ex) {

        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(error(ex.getMessage()));
    }

    // ── 400 Bad Request ──────────────────────────────────────────────────────

    @ExceptionHandler(InvalidPriceRangeException.class)
    public ResponseEntity<Map<String, String>> handleInvalidPriceRange(
            InvalidPriceRangeException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(error(ex.getMessage()));
    }

    // ── 409 Conflict ─────────────────────────────────────────────────────────

    @ExceptionHandler(StoreAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleStoreAlreadyExists(
            StoreAlreadyExistsException ex) {

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(error(ex.getMessage()));
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleEmailAlreadyExists(
            EmailAlreadyExistsException ex) {

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(error(ex.getMessage()));
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, String>> handleUserAlreadyExists(
            UserAlreadyExistsException ex) {

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(error(ex.getMessage()));
    }

    // ── helper ───────────────────────────────────────────────────────────────

    private Map<String, String> error(String message) {
        return Map.of("error", message);
    }
}
