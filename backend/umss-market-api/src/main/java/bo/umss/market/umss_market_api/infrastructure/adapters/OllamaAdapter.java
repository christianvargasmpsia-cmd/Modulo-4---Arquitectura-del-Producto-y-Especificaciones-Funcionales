package bo.umss.market.umss_market_api.infrastructure.adapters;
import bo.umss.market.umss_market_api.domain.ports.AIProviderPort;
import bo.umss.market.umss_market_api.infrastructure.dto.request.OllamaRequest;
import bo.umss.market.umss_market_api.infrastructure.dto.response.OllamaResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class OllamaAdapter implements AIProviderPort {

    private final RestTemplate restTemplate;

    private static final String URL =
            "http://localhost:11434/api/generate";

    public OllamaAdapter(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    public String generate(String prompt) {

        OllamaRequest request =
                new OllamaRequest("llama3.2:3b", prompt, false);

        OllamaResponse response =
                restTemplate.postForObject(
                        URL,
                        request,
                        OllamaResponse.class
                );

        return response.getResponse();
    }
}