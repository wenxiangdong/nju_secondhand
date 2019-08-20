package nju.secondhand.service.impl;

import nju.secondhand.service.CloudService;
import nju.secondhand.service.OrderService;
import nju.secondhand.util.MapObjectUtil;
import nju.secondhand.util.Pair;
import nju.secondhand.vo.OrderVO;
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
    public List<OrderVO> getOrders(String keyword, int lastIndex, int size, long timestamp) {

        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, MapObjectUtil.mapObject(
                Pair.of("$url", "getOrders"),
                Pair.of("keyword", keyword),
                Pair.of("lastIndex", lastIndex),
                Pair.of("size", size),
                Pair.of("timestamp", timestamp)));
    }
}
