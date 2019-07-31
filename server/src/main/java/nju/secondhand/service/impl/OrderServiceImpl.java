package nju.secondhand.service.impl;

import nju.secondhand.service.OrderService;
import nju.secondhand.vo.OrderVO;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author cst
 */
@Service
public class OrderServiceImpl implements OrderService {
    @Override
    public List<OrderVO> getOrders(String keyword, int lastIndex, int size) {
        return null;
    }
}
