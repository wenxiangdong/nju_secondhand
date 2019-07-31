package nju.secondhand.controller;

import nju.secondhand.response.HttpResponse;
import nju.secondhand.service.OrderService;
import nju.secondhand.vo.OrderVO;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * @author cst
 */
@RestController
@CrossOrigin(value = "*", methods = {RequestMethod.GET, RequestMethod.POST}, allowCredentials = "true")
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/getOrders")
    public HttpResponse<List<OrderVO>> getOrders(String keyword, int lastIndex, int size) {
        return new HttpResponse<>(orderService.getOrders(keyword, lastIndex, size));
    }
}
