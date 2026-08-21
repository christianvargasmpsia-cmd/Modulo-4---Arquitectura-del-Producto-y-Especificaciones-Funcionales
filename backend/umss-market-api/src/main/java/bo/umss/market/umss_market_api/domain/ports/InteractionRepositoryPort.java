package bo.umss.market.umss_market_api.domain.ports;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.enums.InteractionType;
import bo.umss.market.umss_market_api.domain.model.Interaction;

public interface InteractionRepositoryPort {

    /**
     * Guarda una nueva interacción.
     */
    Interaction save(Interaction interaction);

    /**
     * Obtiene todas las interacciones de un usuario.
     */
    List<Interaction> findByUserId(UUID userId);

    /**
     * Obtiene las interacciones recientes de un usuario.
     */
    List<Interaction> findRecentByUserId(UUID userId, int limit);

    /**
     * Obtiene las interacciones de un usuario por tipo.
     */
    List<Interaction> findByUserIdAndType(
            UUID userId,
            InteractionType type
    );

    /**
     * Obtiene una interacción por ID.
     */
    Optional<Interaction> findById(UUID id);

    /**
     * Elimina una interacción por ID.
     */
    void deleteById(UUID id);
}