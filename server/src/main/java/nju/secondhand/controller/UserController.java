package nju.secondhand.controller;

import nju.secondhand.response.HttpResponse;
import nju.secondhand.service.UserService;
import nju.secondhand.vo.UserVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author cst
 */
@RestController
@CrossOrigin(value = "*", methods = {RequestMethod.GET, RequestMethod.POST}, allowCredentials = "true")
public class UserController {
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/getNormalUsers")
    public HttpResponse<List<UserVO>> getNormalUsers(String keyword, int lastIndex, int size) {
        return new HttpResponse<>(userService.getNormalUsers(keyword, lastIndex, size));
    }

    @PostMapping("/freezeUser")
    public HttpResponse<Void> freezeUser(String userID) {
        userService.freezeUser(userID);
        return new HttpResponse<>();
    }

    @GetMapping("/getFrozenUsers")
    public HttpResponse<List<UserVO>> getFrozenUsers(String keyword, int lastIndex, int size) {
        return new HttpResponse<>(userService.getFrozenUsers(keyword, lastIndex, size));
    }

    @PostMapping("/unfreezeUser")
    public HttpResponse<Void> unfreezeUser(String userID) {
        userService.unfreezeUser(userID);
        return new HttpResponse<>();
    }
}
