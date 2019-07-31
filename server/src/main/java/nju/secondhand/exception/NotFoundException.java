package nju.secondhand.exception;

import nju.secondhand.response.HttpCode;

/**
 * @author cst
 */
public class NotFoundException extends SystemException {
    public NotFoundException(String message) {
        super(HttpCode.NOT_FOUND, message);
    }
}
