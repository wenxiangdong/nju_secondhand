package nju.secondhand.controller;

import nju.secondhand.response.HttpResponse;
import nju.secondhand.service.OrderService;
import nju.secondhand.util.LoginUtil;
import nju.secondhand.vo.OrderVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.util.List;

/**
 * @author cst
 */
@RestController
public class OrderController {
    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/getOrders")
    public HttpResponse<List<OrderVO>> getOrders(@RequestParam(defaultValue = "") String keyword, @RequestParam(defaultValue = "0") int lastIndex, @RequestParam(defaultValue = "10") int size, HttpSession session) {
        LoginUtil.checkLogin(session);
        return new HttpResponse<>(orderService.getOrders(keyword, lastIndex, size));
    }
}
