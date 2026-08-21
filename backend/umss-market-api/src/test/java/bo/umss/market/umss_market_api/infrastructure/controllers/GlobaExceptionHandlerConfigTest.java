package bo.umss.market.umss_market_api.infrastructure.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import bo.umss.market.umss_market_api.domain.exceptions.EmailAlreadyExistsException;
import bo.umss.market.umss_market_api.domain.exceptions.PublicationNotFoundException;
import bo.umss.market.umss_market_api.domain.exceptions.StoreAlreadyExistsException;
import bo.umss.market.umss_market_api.domain.exceptions.UserAlreadyExistsException;
import bo.umss.market.umss_market_api.shared.GlobalExceptionHandler;

class GlobalExceptionHandlerConfigTest {

    private final GlobalExceptionHandler handler =
            new GlobalExceptionHandler();

    @Test
    void shouldHandle_PublicationNotFound_with404() {

        var response = handler.handlePublicationNotFound(
                new PublicationNotFoundException(
                        "Publicación no encontrada"));

        assertEquals(
                404,
                response.getStatusCode().value());

        assertEquals(
                "Publicación no encontrada",
                response.getBody().getMessage());
    }

    @Test
    void shouldHandle_StoreAlreadyExists_with409() {

        var response = handler.handleStoreAlreadyExists(
                new StoreAlreadyExistsException(
                        "Tienda ya existe"));

        assertEquals(
                409,
                response.getStatusCode().value());
    }

    @Test
    void shouldHandle_EmailAlreadyExists_with409() {

        var response = handler.handleEmailAlreadyExists(
                new EmailAlreadyExistsException(
                        "Email ya existe"));

        assertEquals(
                409,
                response.getStatusCode().value());
    }

    @Test
    void shouldHandle_UserAlreadyExists_with409() {

        var response = handler.handleUserAlreadyExists(
                new UserAlreadyExistsException(
                        "RU ya registrado"));

        assertEquals(
                409,
                response.getStatusCode().value());
    }
}