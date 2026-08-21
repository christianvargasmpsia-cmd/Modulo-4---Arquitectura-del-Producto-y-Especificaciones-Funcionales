package bo.umss.market.umss_market_api.infrastructure.controllers;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import bo.umss.market.umss_market_api.application.dto.CreateStoreResponse;
import bo.umss.market.umss_market_api.application.dto.PublicationInStoreResponse;
import bo.umss.market.umss_market_api.application.dto.StorePublicProfileResponse;
import bo.umss.market.umss_market_api.application.dto.StoreSummaryResponse;
import bo.umss.market.umss_market_api.application.usecases.CreateStoreUseCase;
import bo.umss.market.umss_market_api.application.usecases.DeleteStoreUseCase;
import bo.umss.market.umss_market_api.application.usecases.GetStorePublicProfileUseCase;
import bo.umss.market.umss_market_api.application.usecases.GetStoresUseCase;
import bo.umss.market.umss_market_api.application.usecases.PatchStoreUseCase;
import bo.umss.market.umss_market_api.application.usecases.UpdateStoreUseCase;
import bo.umss.market.umss_market_api.domain.enums.StoreStatus;
import bo.umss.market.umss_market_api.domain.exceptions.StoreNotFoundException;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.shared.GlobalExceptionHandler;

class StoreControllerTest {

    private GetStoresUseCase getStoresUseCase;

    private GetStorePublicProfileUseCase getStorePublicProfileUseCase;

    private CreateStoreUseCase createStoreUseCase;

    private UpdateStoreUseCase updateStoreUseCase;

    private PatchStoreUseCase patchStoreUseCase;

    private DeleteStoreUseCase deleteStoreUseCase;

    private StoreController controller;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {

        getStoresUseCase =
                mock(GetStoresUseCase.class);

        getStorePublicProfileUseCase =
                mock(GetStorePublicProfileUseCase.class);

        createStoreUseCase =
                mock(CreateStoreUseCase.class);

        updateStoreUseCase =
                mock(UpdateStoreUseCase.class);

        patchStoreUseCase =
                mock(PatchStoreUseCase.class);

        deleteStoreUseCase =
                mock(DeleteStoreUseCase.class);

        controller =
                new StoreController(
                        getStoresUseCase,
                        getStorePublicProfileUseCase,
                        createStoreUseCase,
                        updateStoreUseCase,
                        patchStoreUseCase,
                        deleteStoreUseCase
                );

        mockMvc =
                MockMvcBuilders
                        .standaloneSetup(controller)
                        .setControllerAdvice(
                                new GlobalExceptionHandler())
                        .build();
    }

    // ============================================================
    // GET /api/stores
    // ============================================================

    @Test
    void shouldReturn200WithAllStores()
            throws Exception {

        UUID storeId1 =
                UUID.randomUUID();

        UUID storeId2 =
                UUID.randomUUID();

        StoreSummaryResponse store1 =
                StoreSummaryResponse.builder()
                        .id(storeId1)
                        .userId(UUID.randomUUID())
                        .nombre("Tech UMSS")
                        .descripcion(
                                "Tecnologia para estudiantes")
                        .categoria("Tecnologia")
                        .telefonoContacto("70712345")
                        .emailContacto(
                                "tech@umss.edu.bo")
                        .status(StoreStatus.ACTIVE)
                        .build();

        StoreSummaryResponse store2 =
                StoreSummaryResponse.builder()
                        .id(storeId2)
                        .userId(UUID.randomUUID())
                        .nombre(
                                "Sabor Universitario")
                        .descripcion(
                                "Alimentos para estudiantes")
                        .categoria("Alimentos")
                        .telefonoContacto("71234567")
                        .emailContacto(
                                "sabor@umss.edu.bo")
                        .status(StoreStatus.ACTIVE)
                        .build();

        when(getStoresUseCase.execute())
                .thenReturn(
                        List.of(
                                store1,
                                store2
                        )
                );

        mockMvc.perform(
                get("/api/stores")
        )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath("$.length()")
                                .value(2)
                )
                .andExpect(
                        jsonPath("$[0].nombre")
                                .value("Tech UMSS")
                )
                .andExpect(
                        jsonPath("$[1].nombre")
                                .value(
                                        "Sabor Universitario")
                );
    }

    // ============================================================
    // GET /api/stores/{id}
    // ============================================================

    @Test
    void shouldReturn200WithStoreProfileWhenStoreExists()
            throws Exception {

        UUID storeId =
                UUID.randomUUID();

        StorePublicProfileResponse profile =
                StorePublicProfileResponse.builder()
                        .id(storeId)
                        .nombre("Pastelería UMSS")
                        .descripcion(
                                "Postres artesanales")
                        .categoria("Alimentos")
                        .telefonoContacto(
                                "78901234")
                        .emailContacto(
                                "pasteleria@umss.bo")
                        .status(StoreStatus.ACTIVE)
                        .publicaciones(
                                List.of()
                        )
                        .build();

        when(
                getStorePublicProfileUseCase
                        .execute(storeId)
        )
                .thenReturn(profile);

        mockMvc.perform(
                get(
                        "/api/stores/{id}",
                        storeId
                )
        )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath("$.id")
                                .value(
                                        storeId.toString())
                )
                .andExpect(
                        jsonPath("$.nombre")
                                .value(
                                        "Pastelería UMSS")
                )
                .andExpect(
                        jsonPath("$.categoria")
                                .value(
                                        "Alimentos")
                )
                .andExpect(
                        jsonPath("$.status")
                                .value(
                                        "ACTIVE")
                )
                .andExpect(
                        jsonPath(
                                "$.publicaciones")
                                .isArray()
                )
                .andExpect(
                        jsonPath(
                                "$.publicaciones.length()")
                                .value(0)
                );
    }

    // ============================================================
    // GET /api/stores/{id}
    // CON PUBLICACIONES
    // ============================================================

    @Test
    void shouldReturn200WithPublicacionesWhenStoreHasPublications()
            throws Exception {

        UUID storeId =
                UUID.randomUUID();

        PublicationInStoreResponse pub =
                PublicationInStoreResponse.builder()
                        .id(UUID.randomUUID())
                        .nombre("Brownie")
                        .activa(true)
                        .build();

        StorePublicProfileResponse profile =
                StorePublicProfileResponse.builder()
                        .id(storeId)
                        .nombre("Tienda Test")
                        .status(StoreStatus.ACTIVE)
                        .publicaciones(
                                List.of(pub)
                        )
                        .build();

        when(
                getStorePublicProfileUseCase
                        .execute(storeId)
        )
                .thenReturn(profile);

        mockMvc.perform(
                get(
                        "/api/stores/{id}",
                        storeId
                )
        )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath(
                                "$.publicaciones.length()")
                                .value(1)
                )
                .andExpect(
                        jsonPath(
                                "$.publicaciones[0].nombre")
                                .value("Brownie")
                );
    }

    // ============================================================
    // POST /api/stores
    // ============================================================

    @Test
    void shouldCreateStore()
            throws Exception {

        UUID storeId =
                UUID.randomUUID();

        UUID userId =
                UUID.randomUUID();

        CreateStoreResponse response =
                CreateStoreResponse.builder()
                        .success(true)
                        .message(
                                "Tienda creada correctamente")
                        .storeId(storeId)
                        .userId(userId)
                        .build();

        when(
                createStoreUseCase
                        .execute(any())
        )
                .thenReturn(response);

        String request = """
                {
                    "userId": "%s",
                    "nombre": "Nueva Tienda",
                    "descripcion": "Tienda de prueba",
                    "categoria": "Tecnologia",
                    "telefonoContacto": "70712345",
                    "emailContacto": "tienda@umss.edu.bo",
                    "status": "ACTIVE"
                }
                """.formatted(userId);

        mockMvc.perform(
                post("/api/stores")
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(
                        status().isCreated()
                )
                .andExpect(
                        jsonPath("$.success")
                                .value(true)
                )
                .andExpect(
                        jsonPath("$.storeId")
                                .value(
                                        storeId.toString())
                )
                .andExpect(
                        jsonPath("$.userId")
                                .value(
                                        userId.toString())
                );
    }

    // ============================================================
    // PUT /api/stores/{id}
    // ============================================================

    @Test
    void shouldUpdateStore()
            throws Exception {

        UUID storeId =
                UUID.randomUUID();

        UUID userId =
                UUID.randomUUID();

        Store updatedStore =
                Store.builder()
                        .id(storeId)
                        .userId(userId)
                        .nombre(
                                "Tech UMSS Actualizada")
                        .descripcion(
                                "Nueva descripcion")
                        .categoria("Tecnologia")
                        .telefonoContacto(
                                "70000000")
                        .emailContacto(
                                "tech@umss.edu.bo")
                        .status(StoreStatus.ACTIVE)
                        .build();

        when(
                updateStoreUseCase.execute(
                        eq(storeId),
                        any()
                )
        )
                .thenReturn(updatedStore);

        String request = """
                {
                    "nombre": "Tech UMSS Actualizada",
                    "descripcion": "Nueva descripcion",
                    "categoria": "Tecnologia",
                    "telefonoContacto": "70000000",
                    "emailContacto": "tech@umss.edu.bo",
                    "status": "ACTIVE"
                }
                """;

        mockMvc.perform(
                put(
                        "/api/stores/{id}",
                        storeId
                )
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath("$.id")
                                .value(
                                        storeId.toString())
                )
                .andExpect(
                        jsonPath("$.nombre")
                                .value(
                                        "Tech UMSS Actualizada")
                );
    }

    // ============================================================
    // PATCH /api/stores/{id}
    // ============================================================

    @Test
    void shouldPatchStore()
            throws Exception {

        UUID storeId =
                UUID.randomUUID();

        UUID userId =
                UUID.randomUUID();

        Store patchedStore =
                Store.builder()
                        .id(storeId)
                        .userId(userId)
                        .nombre("Tech UMSS")
                        .descripcion(
                                "Descripcion actualizada")
                        .categoria("Tecnologia")
                        .telefonoContacto(
                                "70712345")
                        .emailContacto(
                                "tech@umss.edu.bo")
                        .status(StoreStatus.ACTIVE)
                        .build();

        when(
                patchStoreUseCase.execute(
                        eq(storeId),
                        any()
                )
        )
                .thenReturn(patchedStore);

        String request = """
                {
                    "descripcion": "Descripcion actualizada"
                }
                """;

        mockMvc.perform(
                patch(
                        "/api/stores/{id}",
                        storeId
                )
                        .contentType(
                                MediaType.APPLICATION_JSON)
                        .content(request)
        )
                .andExpect(
                        status().isOk()
                )
                .andExpect(
                        jsonPath("$.id")
                                .value(
                                        storeId.toString())
                )
                .andExpect(
                        jsonPath("$.descripcion")
                                .value(
                                        "Descripcion actualizada")
                );
    }

    // ============================================================
    // DELETE /api/stores/{id}
    // ============================================================

    @Test
    void shouldDeleteStore()
            throws Exception {

        UUID storeId =
                UUID.randomUUID();

        doNothing()
                .when(deleteStoreUseCase)
                .execute(storeId);

        mockMvc.perform(
                delete(
                        "/api/stores/{id}",
                        storeId
                )
        )
                .andExpect(
                        status().isNoContent()
                );

        verify(deleteStoreUseCase)
                .execute(storeId);
    }

    // ============================================================
    // GET /api/stores/{id}
    // NOT FOUND
    // ============================================================

    @Test
    void shouldReturn404WhenStoreDoesNotExist()
            throws Exception {

        UUID storeId =
                UUID.randomUUID();

        when(
                getStorePublicProfileUseCase
                        .execute(storeId)
        )
                .thenThrow(
                        new StoreNotFoundException(
                                "Tienda no encontrada"
                        )
                );

        mockMvc.perform(
                get(
                        "/api/stores/{id}",
                        storeId
                )
        )
                .andExpect(
                        status().isNotFound()
                )
                .andExpect(
                        jsonPath("$.message")
                                .value(
                                        "Tienda no encontrada")
                );
    }
}