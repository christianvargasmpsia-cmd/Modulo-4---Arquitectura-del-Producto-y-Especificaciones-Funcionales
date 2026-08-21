package bo.umss.market.umss_market_api.infrastructure.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import bo.umss.market.umss_market_api.application.dto.CatalogFilterRequest;
import bo.umss.market.umss_market_api.application.dto.CreatePublicationRequest;
import bo.umss.market.umss_market_api.application.dto.CreatePublicationResponse;
import bo.umss.market.umss_market_api.application.dto.PublicationSummaryResponse;
import bo.umss.market.umss_market_api.application.dto.UpdatePublicationRequest;
import bo.umss.market.umss_market_api.application.dto.UpdatePublicationStatusRequest;

import bo.umss.market.umss_market_api.application.usecases.CreatePublicationUseCase;
import bo.umss.market.umss_market_api.application.usecases.DeletePublicationUseCase;
import bo.umss.market.umss_market_api.application.usecases.GetPublicationByIdUseCase;
import bo.umss.market.umss_market_api.application.usecases.SearchCatalogUseCase;
import bo.umss.market.umss_market_api.application.usecases.UpdatePublicationStatusUseCase;
import bo.umss.market.umss_market_api.application.usecases.UpdatePublicationUseCase;

import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import bo.umss.market.umss_market_api.domain.exceptions.InvalidPriceRangeException;
import bo.umss.market.umss_market_api.domain.model.Publication;

import bo.umss.market.umss_market_api.shared.GlobalExceptionHandler;

class PublicationControllerTest {

    private CreatePublicationUseCase createUseCase;

    private SearchCatalogUseCase searchUseCase;

    private GetPublicationByIdUseCase getByIdUseCase;

    private UpdatePublicationUseCase updateUseCase;

    private UpdatePublicationStatusUseCase updateStatusUseCase;

    private DeletePublicationUseCase deleteUseCase;

    private PublicationController controller;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {

        createUseCase =
                mock(CreatePublicationUseCase.class);

        searchUseCase =
                mock(SearchCatalogUseCase.class);

        getByIdUseCase =
                mock(GetPublicationByIdUseCase.class);

        updateUseCase =
                mock(UpdatePublicationUseCase.class);

        updateStatusUseCase =
                mock(UpdatePublicationStatusUseCase.class);

        deleteUseCase =
                mock(DeletePublicationUseCase.class);

        controller =
                new PublicationController(
                        createUseCase,
                        searchUseCase,
                        getByIdUseCase,
                        updateUseCase,
                        updateStatusUseCase,
                        deleteUseCase
                );

        mockMvc =
                MockMvcBuilders
                        .standaloneSetup(controller)
                        .setControllerAdvice(
                                new GlobalExceptionHandler()
                        )
                        .build();
    }

    // ============================================================
    // POST /api/publications
    // CREAR PUBLICACIÓN
    // ============================================================

    @Test
    void shouldCreatePublication() {

        UUID publicationId =
                UUID.randomUUID();

        CreatePublicationResponse response =
                CreatePublicationResponse.builder()
                        .success(true)
                        .message("OK")
                        .publicationId(publicationId)
                        .build();

        when(
                createUseCase.execute(
                        any(CreatePublicationRequest.class)
                )
        ).thenReturn(response);

        var result =
                controller.createPublication(
                        new CreatePublicationRequest()
                );

        assertEquals(
                201,
                result.getStatusCode().value()
        );

        assertNotNull(
                result.getBody()
        );

        assertTrue(
                result.getBody().isSuccess()
        );

        assertEquals(
                publicationId,
                result.getBody().getPublicationId()
        );
    }

    // ============================================================
    // GET /api/publications
    // BUSCAR CATÁLOGO
    // ============================================================

    @Test
    void shouldSearchCatalog() {

        PublicationSummaryResponse summary =
                PublicationSummaryResponse.builder()
                        .id(UUID.randomUUID())
                        .nombre("Brownie")
                        .precio(BigDecimal.TEN)
                        .tipo(PublicationType.PRODUCTO)
                        .build();

        when(
                searchUseCase.execute(
                        any(CatalogFilterRequest.class)
                )
        ).thenReturn(
                List.of(summary)
        );

        var result =
                controller.search(
                        new CatalogFilterRequest()
                );

        assertNotNull(
                result.getBody()
        );

        assertEquals(
                1,
                result.getBody().size()
        );

        assertEquals(
                "Brownie",
                result.getBody()
                        .get(0)
                        .getNombre()
        );
    }

    // ============================================================
    // GET /api/publications/{id}
    // OBTENER PUBLICACIÓN POR ID
    // ============================================================

    @Test
    void shouldGetPublicationById() {

        UUID id =
                UUID.randomUUID();

        Publication publication =
                Publication.builder()
                        .id(id)
                        .nombre("Brownie")
                        .precio(BigDecimal.TEN)
                        .tipo(PublicationType.PRODUCTO)
                        .build();

        when(
                getByIdUseCase.execute(id)
        ).thenReturn(publication);

        var result =
                controller.findById(id);

        assertNotNull(
                result.getBody()
        );

        assertEquals(
                id,
                result.getBody().getId()
        );

        assertEquals(
                "Brownie",
                result.getBody().getNombre()
        );
    }

    // ============================================================
    // PUT /api/publications/{id}
    // ACTUALIZAR PUBLICACIÓN
    // ============================================================

    @Test
    void shouldUpdatePublication() {

        UUID id =
                UUID.randomUUID();

        UpdatePublicationRequest request =
                new UpdatePublicationRequest();

        Publication updatedPublication =
                Publication.builder()
                        .id(id)
                        .nombre("Brownie Renovado")
                        .descripcion(
                                "Brownie actualizado"
                        )
                        .precio(
                                BigDecimal.valueOf(15)
                        )
                        .tipo(
                                PublicationType.PRODUCTO
                        )
                        .stock(20)
                        .activa(true)
                        .build();

        when(
                updateUseCase.execute(
                        id,
                        request
                )
        ).thenReturn(updatedPublication);

        var result =
                controller.updatePublication(
                        id,
                        request
                );

        assertEquals(
                200,
                result.getStatusCode().value()
        );

        assertNotNull(
                result.getBody()
        );

        assertEquals(
                id,
                result.getBody().getId()
        );

        assertEquals(
                "Brownie Renovado",
                result.getBody().getNombre()
        );

        verify(updateUseCase)
                .execute(id, request);
    }

    // ============================================================
    // PATCH /api/publications/{id}/status
    // ACTIVAR / DESACTIVAR
    // ============================================================

    @Test
    void shouldUpdatePublicationStatus() {

        UUID id =
                UUID.randomUUID();

        UpdatePublicationStatusRequest request =
                new UpdatePublicationStatusRequest();

        Publication publication =
                Publication.builder()
                        .id(id)
                        .nombre("Brownie")
                        .precio(BigDecimal.TEN)
                        .tipo(PublicationType.PRODUCTO)
                        .activa(false)
                        .build();

        when(
                updateStatusUseCase.execute(
                        id,
                        request
                )
        ).thenReturn(publication);

        var result =
                controller.updatePublicationStatus(
                        id,
                        request
                );

        assertEquals(
                200,
                result.getStatusCode().value()
        );

        assertNotNull(
                result.getBody()
        );

        assertEquals(
                id,
                result.getBody().getId()
        );

        assertEquals(
                false,
                result.getBody().getActiva()
        );

        verify(updateStatusUseCase)
                .execute(id, request);
    }

    // ============================================================
    // DELETE /api/publications/{id}
    // ELIMINAR PUBLICACIÓN
    // ============================================================

    @Test
    void shouldDeletePublication() {

        UUID id =
                UUID.randomUUID();

        var result =
                controller.deletePublication(id);

        assertEquals(
                204,
                result.getStatusCode().value()
        );

        verify(deleteUseCase)
                .execute(id);
    }

    // ============================================================
    // GET /api/publications
    // SIN RESULTADOS
    // ============================================================

    @Test
    void shouldReturn200WithEmptyListWhenNoPublications()
            throws Exception {

        when(
                searchUseCase.execute(
                        any(CatalogFilterRequest.class)
                )
        ).thenReturn(
                List.of()
        );

        mockMvc.perform(
                get("/api/publications")
        )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath("$").isArray()
                )
                .andExpect(
                        jsonPath("$.length()")
                                .value(0)
                );
    }

    // ============================================================
    // GET /api/publications
    // CON RESULTADOS
    // ============================================================

    @Test
    void shouldReturn200WithResultsWhenPublicationsExist()
            throws Exception {

        PublicationSummaryResponse summary =
                PublicationSummaryResponse.builder()
                        .id(UUID.randomUUID())
                        .nombre("Brownie")
                        .precio(BigDecimal.TEN)
                        .tipo(PublicationType.PRODUCTO)
                        .activa(true)
                        .build();

        when(
                searchUseCase.execute(
                        any(CatalogFilterRequest.class)
                )
        ).thenReturn(
                List.of(summary)
        );

        mockMvc.perform(
                get("/api/publications")
        )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath("$.length()")
                                .value(1)
                )
                .andExpect(
                        jsonPath("$[0].nombre")
                                .value("Brownie")
                );
    }

    // ============================================================
    // GET /api/publications?texto=torta
    // ============================================================

    @Test
    void shouldReturn200WithTextoParam()
            throws Exception {

        PublicationSummaryResponse summary =
                PublicationSummaryResponse.builder()
                        .id(UUID.randomUUID())
                        .nombre("Torta")
                        .precio(
                                BigDecimal.valueOf(20)
                        )
                        .tipo(
                                PublicationType.PRODUCTO
                        )
                        .activa(true)
                        .build();

        when(
                searchUseCase.execute(
                        any(CatalogFilterRequest.class)
                )
        ).thenReturn(
                List.of(summary)
        );

        mockMvc.perform(
                get("/api/publications")
                        .param(
                                "texto",
                                "torta"
                        )
        )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath("$[0].nombre")
                                .value("Torta")
                );
    }

    // ============================================================
    // GET /api/publications?tipo=SERVICIO
    // ============================================================

    @Test
    void shouldReturn200WithTipoParam()
            throws Exception {

        PublicationSummaryResponse summary =
                PublicationSummaryResponse.builder()
                        .id(UUID.randomUUID())
                        .nombre("Clases de ingles")
                        .precio(
                                BigDecimal.valueOf(50)
                        )
                        .tipo(
                                PublicationType.SERVICIO
                        )
                        .activa(true)
                        .build();

        when(
                searchUseCase.execute(
                        any(CatalogFilterRequest.class)
                )
        ).thenReturn(
                List.of(summary)
        );

        mockMvc.perform(
                get("/api/publications")
                        .param(
                                "tipo",
                                "SERVICIO"
                        )
        )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath("$[0].tipo")
                                .value("SERVICIO")
                );
    }

    // ============================================================
    // GET /api/publications
    // RANGO DE PRECIO
    // ============================================================

    @Test
    void shouldReturn200WithPrecioRangeParams()
            throws Exception {

        PublicationSummaryResponse summary =
                PublicationSummaryResponse.builder()
                        .id(UUID.randomUUID())
                        .nombre("Muffin")
                        .precio(
                                BigDecimal.valueOf(15)
                        )
                        .tipo(
                                PublicationType.PRODUCTO
                        )
                        .activa(true)
                        .build();

        when(
                searchUseCase.execute(
                        any(CatalogFilterRequest.class)
                )
        ).thenReturn(
                List.of(summary)
        );

        mockMvc.perform(
                get("/api/publications")
                        .param(
                                "precioMin",
                                "10"
                        )
                        .param(
                                "precioMax",
                                "20"
                        )
        )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath("$[0].nombre")
                                .value("Muffin")
                );
    }

    // ============================================================
    // RANGO DE PRECIO INVÁLIDO
    // ============================================================

    @Test
    void shouldReturn400WhenPrecioMinExceedsPrecioMax()
            throws Exception {

        when(
                searchUseCase.execute(
                        any(CatalogFilterRequest.class)
                )
        ).thenThrow(
                new InvalidPriceRangeException(
                        "precioMin no puede ser mayor que precioMax"
                )
        );

        mockMvc.perform(
                get("/api/publications")
                        .param(
                                "precioMin",
                                "100"
                        )
                        .param(
                                "precioMax",
                                "50"
                        )
        )
                .andExpect(
                        status().isBadRequest()
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "precioMin no puede ser mayor que precioMax"
                                )
                );
    }
}