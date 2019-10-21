package nju.secondhand.service;

/**
 * @author cst
 */
public interface AdminService {
    /**
     * 检查用户名与密码是否存在
     *
     * @param username 用户名
     * @param password 密码
     * @return 检查结果
     */
    boolean existsUsernameAndPassword(String username, String password);
}
