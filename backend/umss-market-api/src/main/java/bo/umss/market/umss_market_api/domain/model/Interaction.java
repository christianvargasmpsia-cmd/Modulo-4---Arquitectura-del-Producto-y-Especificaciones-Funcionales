
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Interaction {
    private UUID id;
    private UUID userId;
    private UUID publicationId;
    private InteractionType type;  // VIEW, FAVORITE, LIKE, COMMENT, PURCHASE
    private String metadata;       // JSON adicional
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

// domain/enums/InteractionType.java
public enum InteractionType {
    VIEW, FAVORITE, LIKE, COMMENT, PURCHASE
}