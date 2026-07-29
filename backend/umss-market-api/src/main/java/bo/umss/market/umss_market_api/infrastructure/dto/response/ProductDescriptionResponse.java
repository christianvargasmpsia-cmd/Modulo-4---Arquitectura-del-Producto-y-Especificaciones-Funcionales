package bo.umss.market.umss_market_api.infrastructure.dto.response;

public class ProductDescriptionResponse {

    private String description;

    public ProductDescriptionResponse() {
    }

    public ProductDescriptionResponse(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}