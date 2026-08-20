package bo.umss.market.umss_market_api.infrastructure.persistence.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import bo.umss.market.umss_market_api.domain.enums.PaymentMode;
import bo.umss.market.umss_market_api.domain.enums.PublicationType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "publications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicationEntity {

    @Id
    private UUID id;

    @Column(nullable = false)
    private UUID storeId;

    @Column(nullable = false)
    private String nombre;

    @Column(length = 2000)
    private String descripcion;

    @Column(nullable = false)
    private BigDecimal precio;

    @Enumerated(EnumType.STRING)
    private PublicationType tipo;

    private Integer stock;

    @Enumerated(EnumType.STRING)
    private PaymentMode modalidadCobro;

    private Boolean activa;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    /**
     * Embedding semántico de la publicación.
     *
     * Actualmente se almacena como JSON/texto
     * en una columna PostgreSQL TEXT.
     *
     * No usamos @Lob porque PostgreSQL ya maneja
     * esta columna como TEXT y Hibernate no necesita
     * acceder a ella como un LOB stream.
     */
    @Column(columnDefinition = "TEXT")
    private String embedding;
}