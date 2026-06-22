package bo.umss.market.umss_market_api.domain.exceptions;

public class StoreNotFoundException extends RuntimeException {

    public StoreNotFoundException(String message) {
        super(message);
    }
}
