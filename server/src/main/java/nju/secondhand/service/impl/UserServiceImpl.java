package nju.secondhand.service.impl;

import nju.secondhand.service.CloudService;
import nju.secondhand.service.UserService;
import nju.secondhand.util.MapObjectUtil;
import nju.secondhand.util.Pair;
import nju.secondhand.vo.UserVO;
import nju.secondhand.vo.state.UserState;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author cst
 */
@Service
public class UserServiceImpl implements UserService {
    private final CloudService cloudService;

    public UserServiceImpl(CloudService cloudService) {
        this.cloudService = cloudService;
    }

    @Override
    public List<UserVO> getNormalUsers(String keyword, int lastIndex, int size, long timestamp) {
        return getUsers(UserState.Normal, keyword, lastIndex, size, timestamp);
    }

    @Override
    public void freezeUser(String userID) {
        updateUser(UserState.Frozen, userID);
    }

    @Override
    public List<UserVO> getFrozenUsers(String keyword, int lastIndex, int size, long timestamp) {
        return getUsers(UserState.Frozen, keyword, lastIndex, size, timestamp);
    }

    @Override
    public void unfreezeUser(String userID) {
        updateUser(UserState.Normal, userID);
    }

    private List<UserVO> getUsers(UserState userState, String keyword, int lastIndex, int size, long timestamp) {

        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, MapObjectUtil.mapObject(
                Pair.of("$url", "getUsers"),
                Pair.of("state", userState.ordinal()),
                Pair.of("keyword", keyword),
                Pair.of("lastIndex", lastIndex),
                Pair.of("size", size),
                Pair.of("timestamp", timestamp)));
    }

    private void updateUser(UserState userState, String userID) {
        cloudService.invokeCloudFunction(Void.class, MapObjectUtil.mapObject(
                Pair.of("$url", "updateUser"),
                Pair.of("userID", userID),
                Pair.of("state", userState.ordinal())
        ));
    }
}


