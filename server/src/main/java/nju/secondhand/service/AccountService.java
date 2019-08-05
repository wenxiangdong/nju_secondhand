package nju.secondhand.service;

import org.springframework.boot.configurationprocessor.json.JSONObject;

public interface AccountService {
    JSONObject pay(String openID, String payTitle, int payAmount, String orderID);
    void withdraw(String openID, int account);
}
