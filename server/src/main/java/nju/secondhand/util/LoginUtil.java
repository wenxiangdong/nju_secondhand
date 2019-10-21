package nju.secondhand.util;

import lombok.experimental.UtilityClass;
import nju.secondhand.exception.NotLoginException;

import javax.servlet.http.HttpSession;

/**
 * @author cst
 */
@UtilityClass
public class LoginUtil {
    private static String ADMIN = "admin";

    public void addLogin(HttpSession session, String username) {
        session.setAttribute(ADMIN, username);
    }

    public void checkLogin(HttpSession session) {
        if (session.getAttribute(ADMIN) == null) {
            throw new NotLoginException("未登录");
        }
    }

    public void removeLogin(HttpSession session) {
        session.removeAttribute(ADMIN);
    }
}
