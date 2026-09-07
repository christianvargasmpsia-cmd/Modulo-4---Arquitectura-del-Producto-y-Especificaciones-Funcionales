package bo.umss.market.umss_market_api.m7;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import java.io.InputStream;
import java.util.Iterator;
import java.util.Set;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.MediaType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import bo.umss.market.umss_market_api.application.services.AIService;
import bo.umss.market.umss_market_api.infrastructure.controllers.AIController;
import bo.umss.market.umss_market_api.shared.GlobalExceptionHandler;

@Tag("agente")
@Tag("contract")
@JsonTest
@ContextConfiguration(classes = ChatContractTest.JsonConfiguration.class)
class ChatContractTest {
    @Configuration
    static class JsonConfiguration {}

    @Autowired private ObjectMapper json;
    private JsonNode schema;
    private AIService service;
    private MockMvc mvc;

    @BeforeEach
    void prepare() throws Exception {
        try (InputStream input = getClass().getResourceAsStream("/contracts/chat-response.schema.json")) {
            assertNotNull(input, "El contrato versionado debe existir");
            schema = json.readTree(input);
        }
        service = mock(AIService.class);
        mvc = MockMvcBuilders.standaloneSetup(new AIController(service))
                .setMessageConverters(new StringHttpMessageConverter(java.nio.charset.StandardCharsets.UTF_8),
                        new MappingJackson2HttpMessageConverter(json))
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @ParameterizedTest
    @ValueSource(strings = {"Una respuesta cualquiera", "{\"texto\":\"sigue siendo texto plano\"}"})
    void successHasPlainTextContractRegardlessOfGeneratedWords(String text) throws Exception {
        when(service.chat("consulta")).thenReturn(text);
        ObjectNode observation = invoke();
        assertEquals(200, observation.path("status").intValue());
        assertTrue(matches(schema, observation), observation.toPrettyString());
        verify(service).chat("consulta");
    }

    @Test
    void providerFailureHas500ErrorObjectContract() throws Exception {
        when(service.chat("consulta")).thenThrow(new IllegalStateException("fallo del doble"));
        ObjectNode observation = invoke();
        assertEquals(500, observation.path("status").intValue());
        assertTrue(matches(schema, observation), observation.toPrettyString());
    }

    @ParameterizedTest
    @ValueSource(strings = {"status", "mediaType", "missingField", "messageType", "successValue", "timestamp", "extraField"})
    void schemaRejectsStructuralMutationsOfAnActualErrorResponse(String mutation) throws Exception {
        when(service.chat("consulta")).thenThrow(new IllegalStateException("fallo controlado"));
        ObjectNode observation = invoke();
        assertTrue(matches(schema, observation));
        ObjectNode body = (ObjectNode) observation.get("body");
        switch (mutation) {
            case "status" -> observation.put("status", 201);
            case "mediaType" -> observation.put("mediaType", "text/html");
            case "missingField" -> body.remove("message");
            case "messageType" -> body.put("message", 42);
            case "successValue" -> body.put("success", true);
            case "timestamp" -> body.put("timestamp", "ayer");
            case "extraField" -> body.put("unexpected", true);
            default -> fail("Mutación no prevista");
        }
        assertFalse(matches(schema, observation), "El contrato debe rechazar: " + mutation);
    }

    private ObjectNode invoke() throws Exception {
        var response = mvc.perform(post("/api/ai/chat").contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\":\"consulta\"}")).andReturn().getResponse();
        MediaType media = MediaType.parseMediaType(response.getContentType());
        String body = response.getContentAsString(java.nio.charset.StandardCharsets.UTF_8);
        ObjectNode observation = json.createObjectNode();
        observation.put("status", response.getStatus());
        observation.put("mediaType", media.getType() + "/" + media.getSubtype());
        if (media.isCompatibleWith(MediaType.APPLICATION_JSON)) {
            observation.set("body", json.readTree(body));
        } else {
            observation.put("body", body);
        }
        return observation;
    }

    // Validador local del SUBCONJUNTO usado por este contrato; no es un motor
    // JSON Schema general. Falla si se agrega una palabra clave no soportada.
    private boolean matches(JsonNode rule, JsonNode value) {
        Set<String> supported = Set.of("$schema", "title", "description", "type",
                "required", "additionalProperties", "properties", "oneOf", "enum", "const", "pattern");
        rule.fieldNames().forEachRemaining(key -> {
            if (!supported.contains(key)) throw new IllegalArgumentException("Keyword no soportada: " + key);
        });
        if (rule.has("type")) {
            JsonNode type = rule.get("type");
            boolean validType = false;
            if (type.isArray()) {
                for (JsonNode option : type) validType |= hasType(value, option.asText());
            } else {
                validType = hasType(value, type.asText());
            }
            if (!validType) return false;
        }
        if (rule.has("const") && !rule.get("const").equals(value)) return false;
        if (rule.has("enum")) {
            boolean found = false;
            for (JsonNode option : rule.get("enum")) found |= option.equals(value);
            if (!found) return false;
        }
        if (value.isTextual() && rule.has("pattern")
                && !java.util.regex.Pattern.compile(rule.get("pattern").asText())
                        .matcher(value.asText()).find()) return false;
        if (value.isObject()) {
            for (JsonNode field : rule.path("required")) {
                if (!value.has(field.asText())) return false;
            }
            JsonNode properties = rule.path("properties");
            Iterator<String> names = value.fieldNames();
            while (names.hasNext()) {
                String name = names.next();
                if (properties.has(name)) {
                    if (!matches(properties.get(name), value.get(name))) return false;
                } else if (rule.has("additionalProperties")
                        && !rule.get("additionalProperties").asBoolean()) return false;
            }
        }
        if (rule.has("oneOf")) {
            int matches = 0;
            for (JsonNode option : rule.get("oneOf")) if (matches(option, value)) matches++;
            if (matches != 1) return false;
        }
        return true;
    }

    private boolean hasType(JsonNode value, String type) {
        return switch (type) {
            case "object" -> value.isObject();
            case "string" -> value.isTextual();
            case "integer" -> value.isIntegralNumber();
            case "boolean" -> value.isBoolean();
            case "null" -> value.isNull();
            default -> throw new IllegalArgumentException("Tipo no soportado: " + type);
        };
    }
}
