package nju.secondhand.response;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

/**
 * @author cst
 */
@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class HttpResponse<T> {
    T data;
    int code;
    String message;

    public HttpResponse() {
        this.data = null;
        this.code = HttpCode.SUCCESS.code;
        this.message = "";
    }

    public HttpResponse(T data) {
        this.data = data;
        this.code = HttpCode.SUCCESS.code;
        this.message = "";
    }

    public HttpResponse(HttpCode code, String message) {
        this.data = null;
        this.code = code.code;
        this.message = message;
    }
}

