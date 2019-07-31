package nju.secondhand.exception;

import nju.secondhand.response.HttpCode;

/**
 * @author cst
 */
public class FailException extends SystemException {
    public FailException(String message) {
        super(HttpCode.FAIL, message);
    }
}
