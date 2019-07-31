package nju.secondhand.exception;

import nju.secondhand.response.HttpCode;

/**
 * @author cst
 */
public class ForbiddenException extends SystemException {
    ForbiddenException(String message) {
        super(HttpCode.FORBIDDEN, message);
    }
}
