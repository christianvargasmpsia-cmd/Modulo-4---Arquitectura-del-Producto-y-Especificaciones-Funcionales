package bo.umss.market.umss_market_api.domain.exceptions;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException() {
        super("Usuario no encontrado");
    }

    public UserNotFoundException(String message) {
        super(message);
    }
}