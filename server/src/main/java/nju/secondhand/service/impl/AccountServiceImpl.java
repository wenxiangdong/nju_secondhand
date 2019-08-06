package nju.secondhand.service.impl;

import com.google.common.collect.ImmutableMultimap;
import lombok.extern.java.Log;
import nju.secondhand.service.AccountService;
import nju.secondhand.service.HttpService;
import nju.secondhand.wxsdk.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Log
@Service
public class AccountServiceImpl implements AccountService {

    public static String RETURN_CODE = "return_code";
    public static String RESULT_CODE = "result_code";
    public static String RETURN_MESSAGE = "return_msg";
    public static String TRANSFER_DESC = "南大小书童提现";

    private HttpService httpService;
    private MyWXPayConfig wxPayConfig;

    @Autowired
    public AccountServiceImpl(
            HttpService httpService,
            MyWXPayConfig wxPayConfig
    ) {
        this.httpService = httpService;
        this.wxPayConfig = wxPayConfig;
    }

    @Override
    public JSONObject pay(String openID, String payTitle, int payAmount, String orderID) {
        JSONObject jsonObject = new JSONObject();
        try {
            WXPay wxPay = new WXPay(this.wxPayConfig, false, false);
            // 预下单数据
            Map<String, String> orderParams = new HashMap<>();
            orderParams.put("body", payTitle);
            orderParams.put("out_trade_no", orderID);
            orderParams.put("device_info", "");
            orderParams.put("fee_type", "CNY");
            orderParams.put("total_fee", String.valueOf(payAmount));
            orderParams.put("spbill_create_ip", "127.0.0.1");
            orderParams.put("notify_url", "http://www.example.com/wxpay/notify");
            orderParams.put("trade_type", "JSAPI");
            orderParams.put("openid", openID);

            // 预下单结果
            Map<String, String> prepayResult = wxPay.unifiedOrder(orderParams);
            System.out.println(prepayResult);
            String returnCode = prepayResult.get(RETURN_CODE);
            String returnMessage = prepayResult.get(RETURN_MESSAGE);
            // 检查业务结果
            if (returnCode.equals(WXPayConstants.SUCCESS)
                    && prepayResult.get(RESULT_CODE).equals(WXPayConstants.SUCCESS)) {
                String nonceStr = WXPayUtil.generateNonceStr().toUpperCase();
                String prepayID = prepayResult.get("prepay_id");
                long timestamp = WXPayUtil.getCurrentTimestamp();
                // 签名
                Map<String, String> toSign = new HashMap<>();
                toSign.put("package", "prepay_id=" + prepayID);
                toSign.put("nonceStr",nonceStr);
                toSign.put("timeStamp", String.valueOf(timestamp));
                toSign.put("signType","MD5");
                toSign.put("appId", wxPayConfig.getAppID());
                String signature = WXPayUtil.generateSignature(toSign, wxPayConfig.getKey());

                // 返回结果
                jsonObject.put("package", toSign.get("package"));
                jsonObject.put("nonceStr", toSign.get("nonceStr"));
                jsonObject.put("timeStamp", toSign.get("timeStamp"));
                jsonObject.put("signType", toSign.get("signType"));
                jsonObject.put("appId", toSign.get("appId"));
                jsonObject.put("paySign", signature);
                System.out.println(jsonObject);
                log.info(jsonObject.toString());
                return jsonObject;
            } else {
                throw new Exception(returnMessage);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public void withdraw(String openID, int amount) {
        Map<String, String > reqData = new HashMap<>();
        reqData.put("partner_trade_no", openID + WXPayUtil.getCurrentTimestamp());
        reqData.put("openid", openID);
        reqData.put("amount", String.valueOf(amount));
        reqData.put("desc", TRANSFER_DESC);
        reqData.put("spbill_create_ip", "127.0.0.1");
        try {
            WXTransfer wxTransfer = new WXTransfer(wxPayConfig);
            Map<String, String> transferResult = wxTransfer.transfer(reqData);
            System.out.println(transferResult);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
