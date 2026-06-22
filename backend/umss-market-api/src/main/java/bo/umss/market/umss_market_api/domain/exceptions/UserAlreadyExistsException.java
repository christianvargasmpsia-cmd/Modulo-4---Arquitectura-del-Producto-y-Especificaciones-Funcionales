package bo.umss.market.umss_market_api.domain.exceptions;

public class UserAlreadyExistsException extends RuntimeException {

    public UserAlreadyExistsException() {
        super("El RU ya se encuentra registrado");
    }

    public UserAlreadyExistsException(String message) {
        super(message);
    }
}