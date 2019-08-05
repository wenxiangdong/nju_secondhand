package nju.secondhand.controller;

import nju.secondhand.exception.SystemException;
import nju.secondhand.response.HttpCode;
import nju.secondhand.response.HttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * @author cst
 */
@ControllerAdvice
@ResponseBody
public class ExceptionAdvice {
    @ExceptionHandler(SystemException.class)
    public HttpResponse systemExceptionHandler(SystemException e) {
        return new HttpResponse(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public HttpResponse exceptionHandler(Exception e) {
        return new HttpResponse(HttpCode.FAIL, e.getMessage());
    }
}
