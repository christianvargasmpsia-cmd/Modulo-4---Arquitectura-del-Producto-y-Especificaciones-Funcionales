package bo.umss.market.umss_market_api.application.services;

import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import org.springframework.stereotype.Service;

@Service
public class AIServiceImpl implements AIService {

    private final AIProviderPort provider;

    public AIServiceImpl(AIProviderPort provider) {
        this.provider = provider;
    }

    @Override
    public String generate(String prompt) {
        return provider.generate(prompt);
    }
}