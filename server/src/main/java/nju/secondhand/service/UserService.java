package nju.secondhand.service;

import nju.secondhand.vo.UserVO;

import java.util.List;

/**
 * @author cst
 */
public interface UserService {
    /**
     * 取得正常用户
     *
     * @param keyword   关键词
     * @param lastIndex 之前总共查询到的数量
     * @param size      本次查询数量
     * @param timestamp 时间戳
     * @return {@link UserVO}
     */
    List<UserVO> getNormalUsers(String keyword, int lastIndex, int size, long timestamp);

    /**
     * 冻结用户
     *
     * @param userID 用户 ID
     */
    void freezeUser(String userID);

    /**
     * 取得冻结用户
     *
     * @param keyword   关键词
     * @param lastIndex 之前总共查询到的数量
     * @param size      本次查询数量
     * @param timestamp 时间戳
     * @return {@link UserVO}
     */
    List<UserVO> getFrozenUsers(String keyword, int lastIndex, int size, long timestamp);

    /**
     * 解冻用户
     *
     * @param userID 用户 ID
     */
    void unfreezeUser(String userID);
}
