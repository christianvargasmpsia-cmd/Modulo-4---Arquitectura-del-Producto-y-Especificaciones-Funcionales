package bo.umss.market.umss_market_api.infrastructure.controllers;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

import bo.umss.market.umss_market_api.domain.exceptions.EmailAlreadyExistsException;
import bo.umss.market.umss_market_api.domain.exceptions.InvalidPriceRangeException;
import bo.umss.market.umss_market_api.domain.exceptions.PublicationNotFoundException;
import bo.umss.market.umss_market_api.domain.exceptions.StoreAlreadyExistsException;
import bo.umss.market.umss_market_api.domain.exceptions.StoreNotFoundException;
import bo.umss.market.umss_market_api.domain.exceptions.UserAlreadyExistsException;
import bo.umss.market.umss_market_api.infrastructure.config.LegacyGlobalExceptionHandler;

class GlobalExceptionHandlerConfigTest {

    private final LegacyGlobalExceptionHandler handler = new LegacyGlobalExceptionHandler();

    @Test
    void shouldHandle_PublicationNotFound_with404() {
        var response = handler.handlePublicationNotFound(
                new PublicationNotFoundException("Publicación no encontrada"));
        assertEquals(404, response.getStatusCode().value());
        assertEquals("Publicación no encontrada", response.getBody().get("error"));
    }

    @Test
    void shouldHandle_StoreAlreadyExists_with409() {
        var response = handler.handleStoreAlreadyExists(
                new StoreAlreadyExistsException("Tienda ya existe"));
        assertEquals(409, response.getStatusCode().value());
    }

    @Test
    void shouldHandle_EmailAlreadyExists_with409() {
        var response = handler.handleEmailAlreadyExists(
                new EmailAlreadyExistsException("Email ya existe"));
        assertEquals(409, response.getStatusCode().value());
    }

    @Test
    void shouldHandle_UserAlreadyExists_with409() {
        var response = handler.handleUserAlreadyExists(
                new UserAlreadyExistsException("RU ya registrado"));
        assertEquals(409, response.getStatusCode().value());
    }
}