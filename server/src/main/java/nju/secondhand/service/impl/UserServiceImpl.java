package nju.secondhand.service.impl;

import com.google.common.collect.ImmutableMap;
import nju.secondhand.service.CloudService;
import nju.secondhand.service.UserService;
import nju.secondhand.vo.UserVO;
import nju.secondhand.vo.state.UserState;
import org.springframework.beans.factory.annotation.Autowired;
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

    @Autowired
    public UserServiceImpl(CloudService cloudService) {
        this.cloudService = cloudService;
    }

    @Override
    public List<UserVO> getNormalUsers(String keyword, int lastIndex, int size) {
        Map<Object, Object> map = ImmutableMap.builder()
                .put("$url", "getUsers")
                .put("type", UserState.Normal)
                .put("keyword", keyword)
                .put("lastIndex", lastIndex)
                .put("size", size)
                .build();
        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, USER_API, map);
    }

    @Override
    public void freezeUser(String userID) {
        Map<Object, Object> map = ImmutableMap.builder()
                .put("$url", "update")
                .put("userID", userID)
                .put("data", ImmutableMap.builder()
                        .put("type", UserState.Frozen).build())
                .build();

        cloudService.invokeCloudFunction(Void.class, USER_API, map);
    }

    @Override
    public List<UserVO> getFrozenUsers(String keyword, int lastIndex, int size) {
        Map<Object, Object> map = ImmutableMap.builder()
                .put("$url", "getUsers")
                .put("type", UserState.Frozen)
                .put("keyword", keyword)
                .put("lastIndex", lastIndex)
                .put("size", size)
                .build();
        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, USER_API, map);
    }

    @Override
    public void unfreezeUser(String userID) {
        Map<Object, Object> map = ImmutableMap.builder()
                .put("$url", "update")
                .put("userID", userID)
                .put("data", ImmutableMap.builder()
                        .put("type", UserState.Normal).build())
                .build();

        cloudService.invokeCloudFunction(Void.class, USER_API, map);
    }
}


