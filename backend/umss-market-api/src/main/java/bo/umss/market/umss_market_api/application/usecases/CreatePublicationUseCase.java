package bo.umss.market.umss_market_api.application.usecases;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import bo.umss.market.umss_market_api.application.dto.CreatePublicationRequest;
import bo.umss.market.umss_market_api.application.dto.CreatePublicationResponse;
import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import bo.umss.market.umss_market_api.domain.model.Publication;
import bo.umss.market.umss_market_api.domain.model.Store;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import bo.umss.market.umss_market_api.domain.ports.PublicationRepositoryPort;
import bo.umss.market.umss_market_api.domain.ports.StoreRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CreatePublicationUseCase {

    private final PublicationRepositoryPort publicationRepository;
    private final StoreRepositoryPort storeRepository;
    private final AIProviderPort aiProvider;
    private final ObjectMapper objectMapper;

    public CreatePublicationResponse execute(
            CreatePublicationRequest request) {

        Store store = storeRepository.findById(request.getStoreId())
                .orElseThrow(() ->
                        new RuntimeException("Tienda no encontrada"));

        if (!store.getStatus().name().equals("ACTIVE")) {
            throw new RuntimeException(
                    "La tienda no está activa");
        }

        if (request.getTipo() == PublicationType.PRODUCTO) {

            if (request.getStock() == null ||
                    request.getStock() < 1) {

                throw new RuntimeException(
                        "Los productos deben tener stock mayor a cero");
            }
        }

        if (request.getTipo() == PublicationType.SERVICIO) {

            if (request.getModalidadCobro() == null) {

                throw new RuntimeException(
                        "Los servicios requieren modalidad de cobro");
            }
        }

        /*
         * ============================================================
         * GENERACIÓN DEL EMBEDDING
         * ============================================================
         *
         * Creamos un texto representativo de la publicación.
         * Este texto será enviado al modelo de embeddings de Ollama.
         */
        String textoEmbedding = String.format("""
                Nombre: %s
                Descripción: %s
                Tipo: %s
                Precio: %s
                Modalidad de cobro: %s
                """,
                request.getNombre(),
                request.getDescripcion(),
                request.getTipo(),
                request.getPrecio(),
                request.getModalidadCobro()
        );

        List<Double> embedding =
                aiProvider.generateEmbedding(textoEmbedding);

        String embeddingJson = null;

        if (!embedding.isEmpty()) {
            try {
                embeddingJson =
                        objectMapper.writeValueAsString(embedding);

            } catch (JsonProcessingException e) {
                throw new RuntimeException(
                        "No fue posible serializar el embedding",
                        e
                );
            }
        }

        /*
         * ============================================================
         * CREACIÓN DE LA PUBLICACIÓN
         * ============================================================
         */
        Publication publication = Publication.builder()
                .id(UUID.randomUUID())
                .storeId(request.getStoreId())
                .nombre(request.getNombre())
                .descripcion(request.getDescripcion())
                .precio(request.getPrecio())
                .tipo(request.getTipo())
                .stock(request.getStock())
                .modalidadCobro(request.getModalidadCobro())
                .activa(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .embedding(embeddingJson)
                .build();

        Publication saved =
                publicationRepository.save(publication);

        return CreatePublicationResponse.builder()
                .success(true)
                .message("Publicación creada correctamente")
                .publicationId(saved.getId())
                .build();
    }
}