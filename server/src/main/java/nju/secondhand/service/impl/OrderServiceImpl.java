package nju.secondhand.service.impl;

import com.google.common.collect.ImmutableMap;
import nju.secondhand.service.CloudService;
import nju.secondhand.service.OrderService;
import nju.secondhand.vo.OrderVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * @author cst
 */
@Service
public class OrderServiceImpl implements OrderService {
    private static final String ORDER_API = "orderApi";
    private final CloudService cloudService;

    @Autowired
    public OrderServiceImpl(CloudService cloudService) {
        this.cloudService = cloudService;
    }

    @Override
    public List<OrderVO> getOrders(String keyword, int lastIndex, int size) {
        Map<Object, Object> map = ImmutableMap.builder()
                .put("$url", "getOrders")
                .put("by", "admin")
                .put("keyword", keyword)
                .put("lastIndex", lastIndex)
                .put("size", size)
                .build();
        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, ORDER_API, map);
    }
}
