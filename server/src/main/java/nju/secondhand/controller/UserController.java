package nju.secondhand.controller;

import nju.secondhand.response.HttpResponse;
import nju.secondhand.service.UserService;
import nju.secondhand.util.LoginUtil;
import nju.secondhand.vo.UserVO;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpSession;
import java.util.List;

/**
 * @author cst
 */
@RestController
@CrossOrigin(value = "*", methods = {RequestMethod.GET, RequestMethod.POST}, allowCredentials = "true")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/getNormalUsers")
    public HttpResponse<List<UserVO>> getNormalUsers(String keyword, int lastIndex, int size, long timestamp, HttpSession session) {
        LoginUtil.checkLogin(session);
        return new HttpResponse<>(userService.getNormalUsers(keyword, lastIndex, size, timestamp));
    }

    @PostMapping("/freezeUser")
    public HttpResponse<Void> freezeUser(String userID, HttpSession session) {
        LoginUtil.checkLogin(session);
        userService.freezeUser(userID);
        return new HttpResponse<>();
    }

    @GetMapping("/getFrozenUsers")
    public HttpResponse<List<UserVO>> getFrozenUsers(String keyword, int lastIndex, int size, long timestamp, HttpSession session) {
        LoginUtil.checkLogin(session);
        return new HttpResponse<>(userService.getFrozenUsers(keyword, lastIndex, size, timestamp));
    }

    @PostMapping("/unfreezeUser")
    public HttpResponse<Void> unfreezeUser(String userID, HttpSession session) {
        LoginUtil.checkLogin(session);
        userService.unfreezeUser(userID);
        return new HttpResponse<>();
    }
}
