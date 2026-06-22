package bo.umss.market.umss_market_api.infrastructure.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;

import bo.umss.market.umss_market_api.application.dto.CreatePublicationRequest;
import bo.umss.market.umss_market_api.application.dto.CreatePublicationResponse;
import bo.umss.market.umss_market_api.application.usecases.CreatePublicationUseCase;
import bo.umss.market.umss_market_api.application.usecases.GetAllPublicationsUseCase;
import bo.umss.market.umss_market_api.application.usecases.GetPublicationByIdUseCase;
import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import bo.umss.market.umss_market_api.domain.model.Publication;

class PublicationControllerTest {

    @Test
    void shouldCreatePublication() {

        CreatePublicationUseCase createUseCase =
                mock(CreatePublicationUseCase.class);

        GetAllPublicationsUseCase getAllUseCase =
                mock(GetAllPublicationsUseCase.class);

        GetPublicationByIdUseCase getByIdUseCase =
                mock(GetPublicationByIdUseCase.class);

        PublicationController controller =
                new PublicationController(
                        createUseCase,
                        getAllUseCase,
                        getByIdUseCase
                );

        CreatePublicationResponse response =
                CreatePublicationResponse.builder()
                        .success(true)
                        .message("OK")
                        .publicationId(UUID.randomUUID())
                        .build();

        when(createUseCase.execute(any()))
                .thenReturn(response);

        var result = controller.createPublication(
                new CreatePublicationRequest());

        assertEquals(201, result.getStatusCode().value());
        assertTrue(result.getBody().isSuccess());
    }

    @Test
    void shouldGetAllPublications() {

        CreatePublicationUseCase createUseCase =
                mock(CreatePublicationUseCase.class);

        GetAllPublicationsUseCase getAllUseCase =
                mock(GetAllPublicationsUseCase.class);

        GetPublicationByIdUseCase getByIdUseCase =
                mock(GetPublicationByIdUseCase.class);

        PublicationController controller =
                new PublicationController(
                        createUseCase,
                        getAllUseCase,
                        getByIdUseCase
                );

        Publication publication =
                Publication.builder()
                        .id(UUID.randomUUID())
                        .nombre("Brownie")
                        .precio(BigDecimal.TEN)
                        .tipo(PublicationType.PRODUCTO)
                        .build();

        when(getAllUseCase.execute())
                .thenReturn(List.of(publication));

        var result = controller.findAll();

        assertEquals(1, result.getBody().size());
    }

    @Test
    void shouldGetPublicationById() {

        CreatePublicationUseCase createUseCase =
                mock(CreatePublicationUseCase.class);

        GetAllPublicationsUseCase getAllUseCase =
                mock(GetAllPublicationsUseCase.class);

        GetPublicationByIdUseCase getByIdUseCase =
                mock(GetPublicationByIdUseCase.class);

        PublicationController controller =
                new PublicationController(
                        createUseCase,
                        getAllUseCase,
                        getByIdUseCase
                );

        UUID id = UUID.randomUUID();

        Publication publication =
                Publication.builder()
                        .id(id)
                        .nombre("Brownie")
                        .precio(BigDecimal.TEN)
                        .tipo(PublicationType.PRODUCTO)
                        .build();

        when(getByIdUseCase.execute(id))
                .thenReturn(publication);

        var result = controller.findById(id);

        assertEquals(id, result.getBody().getId());
    }
}