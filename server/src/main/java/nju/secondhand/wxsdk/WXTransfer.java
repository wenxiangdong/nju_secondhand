package nju.secondhand.wxsdk;

import java.util.Map;

public class WXTransfer {
    private final WXPay wxPay;
    private final WXPayConfig wxPayConfig;
    public WXTransfer(WXPayConfig config) throws Exception {
        this.wxPay = new WXPay(config, false, false);
        this.wxPayConfig = config;
    }

    public Map<String, String> transfer(Map<String, String> reqData) throws Exception {
        final String url = WXPayConstants.ENTERPRISE_TRANSFER;
        String responseXml = this.wxPay.requestWithoutCert(
                url,
                this.fillReqData(reqData),
                this.wxPayConfig.getHttpConnectTimeoutMs(),
                this.wxPayConfig.getHttpReadTimeoutMs()
        );

        return this.wxPay.processResponseXml(responseXml);
    }

    public Map<String, String> fillReqData(Map<String, String> reqData) throws Exception {
        reqData.put("mch_appid", wxPayConfig.getAppID());
        reqData.put("mchid", wxPayConfig.getMchID());
        reqData.put("check_name", "NO_CHECK");
        reqData.put("nonce_str", WXPayUtil.generateNonceStr());
        // 不需要sign type 并且 只能 用 md5加密
        reqData.put("sign", WXPayUtil.generateSignature(reqData, wxPayConfig.getKey(), WXPayConstants.SignType.MD5));
        return reqData;
    }
}
