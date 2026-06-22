package bo.umss.market.umss_market_api.infrastructure.controllers;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import bo.umss.market.umss_market_api.application.dto.PublicationInStoreResponse;
import bo.umss.market.umss_market_api.application.dto.StorePublicProfileResponse;
import bo.umss.market.umss_market_api.application.usecases.GetStorePublicProfileUseCase;
import bo.umss.market.umss_market_api.domain.enums.StoreStatus;
import bo.umss.market.umss_market_api.domain.exceptions.StoreNotFoundException;
import bo.umss.market.umss_market_api.infrastructure.config.GlobalExceptionHandler;

class StoreControllerTest {

    private GetStorePublicProfileUseCase getStorePublicProfileUseCase;
    private StoreController controller;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        getStorePublicProfileUseCase = mock(GetStorePublicProfileUseCase.class);
        controller = new StoreController(getStorePublicProfileUseCase);
        mockMvc = MockMvcBuilders
                .standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    // ── GET /api/tiendas/{id} ─────────────────────────────────────────────────

    @Test
    void shouldReturn200WithStoreProfileWhenStoreExists() throws Exception {

        UUID storeId = UUID.randomUUID();

        StorePublicProfileResponse profile = StorePublicProfileResponse.builder()
                .id(storeId)
                .nombre("Pastelería UMSS")
                .descripcion("Postres artesanales")
                .categoria("Alimentos")
                .telefonoContacto("78901234")
                .emailContacto("pasteleria@umss.bo")
                .status(StoreStatus.ACTIVE)
                .publicaciones(List.of())
                .build();

        when(getStorePublicProfileUseCase.execute(storeId))
                .thenReturn(profile);

        mockMvc.perform(get("/api/tiendas/{id}", storeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(storeId.toString()))
                .andExpect(jsonPath("$.nombre").value("Pastelería UMSS"))
                .andExpect(jsonPath("$.categoria").value("Alimentos"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.publicaciones").isArray())
                .andExpect(jsonPath("$.publicaciones.length()").value(0));
    }

    @Test
    void shouldReturn200WithPublicacionesWhenStoreHasPublications() throws Exception {

        UUID storeId = UUID.randomUUID();

        PublicationInStoreResponse pub = PublicationInStoreResponse.builder()
                .id(UUID.randomUUID())
                .nombre("Brownie")
                .activa(true)
                .build();

        StorePublicProfileResponse profile = StorePublicProfileResponse.builder()
                .id(storeId)
                .nombre("Tienda Test")
                .status(StoreStatus.ACTIVE)
                .publicaciones(List.of(pub))
                .build();

        when(getStorePublicProfileUseCase.execute(storeId))
                .thenReturn(profile);

        mockMvc.perform(get("/api/tiendas/{id}", storeId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publicaciones.length()").value(1))
                .andExpect(jsonPath("$.publicaciones[0].nombre").value("Brownie"));
    }

    @Test
    void shouldReturn404WhenStoreDoesNotExist() throws Exception {

        UUID storeId = UUID.randomUUID();

        when(getStorePublicProfileUseCase.execute(storeId))
                .thenThrow(new StoreNotFoundException("Tienda no encontrada"));

        mockMvc.perform(get("/api/tiendas/{id}", storeId))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Tienda no encontrada"));
    }
}
