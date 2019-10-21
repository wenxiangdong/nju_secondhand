package nju.secondhand.controller;

import nju.secondhand.response.HttpResponse;
import nju.secondhand.service.AdminService;
import nju.secondhand.util.LoginUtil;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;

/**
 * @author cst
 */
@RestController
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/login")
    public HttpResponse<Boolean> login(String username, String password, HttpSession session) {
        boolean exists = adminService.existsUsernameAndPassword(username, password);
        if (exists) {
            LoginUtil.addLogin(session, username);
        }
        return new HttpResponse<>(exists);
    }

    @PostMapping("/logout")
    public HttpResponse<Void> logout(HttpSession session) {
        LoginUtil.removeLogin(session);
        return new HttpResponse<>();
    }
}
