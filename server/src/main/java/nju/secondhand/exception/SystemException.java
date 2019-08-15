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
    int code;

    String message;

    SystemException(HttpCode code, String message) {
        this.code = code.getCode();
        this.message = message;
    }

    public SystemException(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
