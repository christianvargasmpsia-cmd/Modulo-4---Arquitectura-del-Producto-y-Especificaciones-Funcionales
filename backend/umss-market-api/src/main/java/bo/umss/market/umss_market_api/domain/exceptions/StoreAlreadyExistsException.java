package bo.umss.market.umss_market_api.domain.exceptions;

public class StoreAlreadyExistsException extends RuntimeException {

    public StoreAlreadyExistsException() {
        super("El emprendedor ya posee una tienda registrada");
    }

    public StoreAlreadyExistsException(String message) {
        super(message);
    }
}