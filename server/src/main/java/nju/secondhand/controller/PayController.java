package nju.secondhand.controller;

import nju.secondhand.response.HttpResponse;
import nju.secondhand.service.PayService;
import nju.secondhand.vo.TransfersResult;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author cst
 */
@RestController
public class PayController {
    private final PayService payService;

    public PayController(PayService payService) {
        this.payService = payService;
    }

    @RequestMapping("/transfers")
    public HttpResponse<TransfersResult> transfers(String openid, int amount, @RequestParam(defaultValue = "") String partner_trade_no) {
        return new HttpResponse<>(payService.transfers(openid, amount, partner_trade_no));
    }
}
