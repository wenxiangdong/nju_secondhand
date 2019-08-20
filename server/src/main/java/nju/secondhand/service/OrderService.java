package nju.secondhand.service;

import nju.secondhand.vo.OrderVO;

import java.util.List;

/**
 * @author cst
 */
public interface OrderService {
    /**
     * 获取订单
     *
     * @param keyword   关键词
     * @param lastIndex 之前总共查询到的数量
     * @param size      本次查询数量
     * @param timestamp 时间戳
     * @return {@link OrderVO}
     */
    List<OrderVO> getOrders(String keyword, int lastIndex, int size, long timestamp);
}
