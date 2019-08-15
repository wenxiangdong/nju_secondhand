package nju.secondhand.service.impl;

import com.google.common.collect.ImmutableMap;
import nju.secondhand.service.CloudService;
import nju.secondhand.service.UserService;
import nju.secondhand.vo.UserVO;
import nju.secondhand.vo.state.UserState;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * @author cst
 */
@Service
public class UserServiceImpl implements UserService {
    private static final String USER_API = "userApi";
    private final CloudService cloudService;

    public UserServiceImpl(CloudService cloudService) {
        this.cloudService = cloudService;
    }

    @Override
    public List<UserVO> getNormalUsers(String keyword, int lastIndex, int size) {
        return getUsers(UserState.Normal, keyword, lastIndex, size);
    }

    @Override
    public void freezeUser(String userID) {
        updateUser(UserState.Frozen, userID);
    }

    @Override
    public List<UserVO> getFrozenUsers(String keyword, int lastIndex, int size) {
        return getUsers(UserState.Frozen, keyword, lastIndex, size);
    }

    @Override
    public void unfreezeUser(String userID) {
        updateUser(UserState.Normal, userID);
    }

    private List<UserVO> getUsers(UserState userState, String keyword, int lastIndex, int size) {
        Map<Object, Object> map = ImmutableMap.builder()
                .put("$url", "getUsersByAdmin")
                .put("state", userState.ordinal())
                .put("keyword", keyword)
                .put("lastIndex", lastIndex)
                .put("size", size)
                .build();
        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, USER_API, map);
    }

    private void updateUser(UserState userState, String userID) {
        Map<Object, Object> map = ImmutableMap.builder()
                .put("$url", "updateUserByAdmin")
                .put("userID", userID)
                .put("state", userState.ordinal())
                .build();

        cloudService.invokeCloudFunction(Void.class, USER_API, map);
    }
}


