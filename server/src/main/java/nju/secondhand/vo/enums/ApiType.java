package nju.secondhand.vo.enums;

import lombok.Getter;

/**
 * @author cst
 */
public enum ApiType {
    /**
     * 用户 API
     */
    USER_API("api"),
    /**
     * 管理员 API
     */
    ADMIN_API("adminApi");

    @Getter
    private final String apiName;

    ApiType(String apiName) {
        this.apiName = apiName;
    }
}
