package nju.secondhand.service.impl;

import lombok.Cleanup;
import lombok.SneakyThrows;
import lombok.extern.log4j.Log4j2;
import nju.secondhand.config.MiniProgramProperties;
import nju.secondhand.exception.FailException;
import nju.secondhand.service.TransferService;
import nju.secondhand.util.XmlUtil;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.ssl.SSLContexts;
import org.apache.http.util.EntityUtils;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import javax.annotation.PostConstruct;
import javax.net.ssl.SSLContext;
import java.security.KeyStore;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * @author cst
 */
@Log4j2
@Service
public class TransferServiceImpl implements TransferService {
    private final MiniProgramProperties miniProgramProperties;
    private static final RequestConfig REQUEST_CONFIG = RequestConfig.custom().setConnectTimeout(10000).build();
    private static final String TRANSFERS_URL = "https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers";

    private SSLContext WX_PAY_SSL_CONTENT;

    public TransferServiceImpl(MiniProgramProperties miniProgramProperties) {
        this.miniProgramProperties = miniProgramProperties;
    }

    @PostConstruct
    @SneakyThrows
    public void init() {
        Resource resource = new ClassPathResource("cert.p12");
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        char[] keyPassword = miniProgramProperties.getMchid().toCharArray();
        keyStore.load(resource.getInputStream(), keyPassword);
        WX_PAY_SSL_CONTENT = SSLContexts.custom()
                .loadKeyMaterial(keyStore, keyPassword)
                .build();
    }

    @Override
    public void transfers(String openid, int amount) {
        transfers(openid, amount, false, "");
    }

    @SuppressWarnings("all")
    private void transfers(String openid, int amount, boolean retry, String partner_trade_no) {
        String new_partner_trade_no = retry ? partner_trade_no : createPartnerTradeNo(openid);
        // 构建参数
        Map<String, String> params = new HashMap<>();
        params.put("mch_appid", miniProgramProperties.getAppId());
        params.put("mchid", miniProgramProperties.getMchid());
        params.put("nonce_str", createNonceStr());
        params.put("partner_trade_no", new_partner_trade_no);
        params.put("openid", openid);
        params.put("check_name", miniProgramProperties.getCheck_name());
        params.put("amount", String.valueOf(amount));
        params.put("desc", miniProgramProperties.getTransfers_desc());
        params.put("spbill_create_ip", miniProgramProperties.getIp());

        // 签名
        String sign = createSign(params);
        params.put("sign", sign);

        //
        String xml = XmlUtil.xmlFormat(params, false);

        // 发送请求
        String result = posts(xml);

        // 解析结果
        Map<String, String> resultMap = XmlUtil.xmlParse(result);

        log.info(resultMap);

        if ("SUCCESS".equals(resultMap.get("return_code"))) {
            if ("SUCCESS".equals(resultMap.get("result_code"))) {
                return;
            } else if ("SYSTEMERROR".equals(resultMap.getOrDefault("error_code", "")) && !retry) {
                // 重试
                transfers(openid, amount, true, new_partner_trade_no);
            } else {
                throw new FailException(resultMap.getOrDefault("error_code_des", "提现失败"));
            }
        } else {
            throw new FailException(resultMap.getOrDefault("return_msg", "提现失败"));
        }
    }

    private String createNonceStr() {
        return UUID.randomUUID().toString().replaceAll("-", "");
    }

    private String createPartnerTradeNo(String openid) {
        String alphaAndNumString = openid.replaceAll("[^a-zA-Z0-9]", "");
        return (alphaAndNumString.length() >= 13 ? alphaAndNumString.substring(alphaAndNumString.length() - 13) : alphaAndNumString)
                + System.currentTimeMillis();
    }

    @SneakyThrows
    private String createSign(Map<String, String> params) {
        String stringA = params.entrySet()
                .stream()
                .sorted(Comparator.comparing(Map.Entry::getKey))
                .map(x -> x.getKey() + "=" + x.getValue())
                .reduce((x, y) -> String.join("&", x, y))
                .orElse("");
        String stringSignTemp = stringA + String.format("&key=%s", miniProgramProperties.getApp_key());
        // MD5加密
        return DigestUtils.md5DigestAsHex(stringSignTemp.getBytes()).toUpperCase();
    }

    @SneakyThrows
    private String posts(String xml) {
        @Cleanup CloseableHttpClient httpClient = HttpClients.custom()
                .setDefaultRequestConfig(REQUEST_CONFIG)
                .setSSLSocketFactory(new SSLConnectionSocketFactory(WX_PAY_SSL_CONTENT,
                        new String[]{"TLSv1", "TLSv1.1", "TLSv1.2"}, null,
                        SSLConnectionSocketFactory.getDefaultHostnameVerifier()))
                .build();

        HttpPost httpPost = new HttpPost(TRANSFERS_URL);
        httpPost.setEntity(new StringEntity(xml, "UTF-8"));

        @Cleanup CloseableHttpResponse httpResponse = httpClient.execute(httpPost);

        return EntityUtils.toString(httpResponse.getEntity());
    }
}
