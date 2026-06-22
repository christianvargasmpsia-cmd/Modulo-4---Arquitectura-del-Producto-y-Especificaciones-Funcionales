package bo.umss.market.umss_market_api.domain.exceptions;

public class EmailAlreadyExistsException extends RuntimeException {

    public EmailAlreadyExistsException() {
        super("El correo electrónico ya se encuentra registrado");
    }

    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}