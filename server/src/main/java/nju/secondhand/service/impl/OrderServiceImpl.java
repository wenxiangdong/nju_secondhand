package nju.secondhand.service.impl;

import nju.secondhand.service.CloudService;
import nju.secondhand.service.OrderService;
import nju.secondhand.util.MapObjectUtil;
import nju.secondhand.vo.OrderVO;
import nju.secondhand.vo.enums.ApiType;
import org.apache.commons.lang3.tuple.Pair;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author cst
 */
@Service
public class OrderServiceImpl implements OrderService {
    private final CloudService cloudService;

    public OrderServiceImpl(CloudService cloudService) {
        this.cloudService = cloudService;
    }

    @Override
    public List<OrderVO> getOrders(String keyword, int lastIndex, int size) {

        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, MapObjectUtil.mapObject(
                Pair.of("$url", "getOrders"),
                Pair.of("keyword", keyword),
                Pair.of("lastIndex", lastIndex),
                Pair.of("size", size)),
                ApiType.ADMIN_API);
    }

    @Override
    public void deleteOrder(String orderID) {
        cloudService.invokeCloudFunction(Void.class, MapObjectUtil.mapObject(
                Pair.of("$url", "deleteOrder"),
                Pair.of("orderID", orderID)), ApiType.ADMIN_API);
    }
}
