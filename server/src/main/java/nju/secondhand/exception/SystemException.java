package nju.secondhand.exception;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import nju.secondhand.response.HttpCode;

/**
 * @author cst
 */
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SystemException extends RuntimeException {
    final HttpCode code;

    final String message;

    SystemException(HttpCode code, String message) {
        this.code = code;
        this.message = message;
    }
}
