package nju.secondhand.controller;

import nju.secondhand.response.HttpResponse;
import nju.secondhand.service.TransferService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author cst
 */
@RestController
public class TransferController {
    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping("/transfers")
    public HttpResponse<Void> transfers(String openid, int amount) {
        transferService.transfers(openid, amount);
        return new HttpResponse<>();
    }
}
