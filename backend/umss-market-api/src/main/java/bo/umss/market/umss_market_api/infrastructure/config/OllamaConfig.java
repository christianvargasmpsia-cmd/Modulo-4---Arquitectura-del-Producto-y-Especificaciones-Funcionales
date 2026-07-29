package bo.umss.market.umss_market_api.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class OllamaConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

}