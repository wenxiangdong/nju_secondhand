package nju.secondhand.service.impl;

import nju.secondhand.service.UserService;
import nju.secondhand.vo.UserVO;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author cst
 */
@Service
public class UserServiceImpl implements UserService {
    @Override
    public List<UserVO> getNormalUsers(String keyword, int lastIndex, int size) {
        return null;
    }

    @Override
    public void freezeUser(String userID) {

    }

    @Override
    public List<UserVO> getFrozenUsers(String keyword, int lastIndex, int size) {
        return null;
    }

    @Override
    public void unfreezeUser(String userID) {

    }
}
