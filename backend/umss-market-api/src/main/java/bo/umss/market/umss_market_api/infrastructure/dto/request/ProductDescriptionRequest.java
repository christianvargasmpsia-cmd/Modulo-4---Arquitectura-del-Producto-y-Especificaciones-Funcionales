package bo.umss.market.umss_market_api.infrastructure.dto.request;

import java.math.BigDecimal;

public class ProductDescriptionRequest {

    private String nombre;
    private String categoria;
    private BigDecimal precio;

    public ProductDescriptionRequest() {
    }

    public ProductDescriptionRequest(String nombre, String categoria, BigDecimal precio) {
        this.nombre = nombre;
        this.categoria = categoria;
        this.precio = precio;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getCategoria() {
        return categoria;
    }

    public void setCategoria(String categoria) {
        this.categoria = categoria;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }
}
