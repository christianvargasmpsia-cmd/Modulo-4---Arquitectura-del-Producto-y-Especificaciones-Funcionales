package bo.umss.market.umss_market_api.application.usecases;

import java.util.UUID;

import org.springframework.stereotype.Service;

import bo.umss.market.umss_market_api.domain.ports.InteractionRepositoryPort;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DeleteInteractionUseCase {

    private final InteractionRepositoryPort interactionRepository;

    public void execute(UUID id) {

        interactionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Interacción no encontrada"
                        )
                );

        interactionRepository.deleteById(id);
    }
}