package nju.secondhand.controller;

import nju.secondhand.service.AccountService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(value = "*", methods = {RequestMethod.GET, RequestMethod.POST}, allowCredentials = "true")
public class AccountController {
    private final AccountService accountService;
    public AccountController(
            AccountService accountService
    ){
        this.accountService = accountService;
    }

    @GetMapping("/testPay")
    public void testPay() {
        this.accountService.pay("dkdkdk", "jdjdj", 100, "jdjdjd");
    }
}
