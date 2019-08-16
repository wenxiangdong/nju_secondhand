package nju.secondhand.response;

import lombok.Getter;

/**
 * @author cst
 */
public enum HttpCode {
    /**
     * 200
     */
    SUCCESS(200),
    NOT_LOGIN(401),
    /**
     * 500
     */
    FAIL(500),
    ;

    @Getter
    int code;

    HttpCode(int code) {
        this.code = code;
    }
}
