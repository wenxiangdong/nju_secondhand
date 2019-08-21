package nju.secondhand.exception;

import nju.secondhand.response.HttpCode;

/**
 * @author cst
 */
public class NotLoginException extends SystemException {
    public NotLoginException(String message) {
        super(HttpCode.NOT_LOGIN, message);
    }
}
