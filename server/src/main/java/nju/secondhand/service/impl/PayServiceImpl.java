package nju.secondhand.service.impl;

import lombok.*;
import nju.secondhand.config.MiniProgramProperties;
import nju.secondhand.config.WechatProperties;
import nju.secondhand.service.PayService;
import nju.secondhand.util.XmlUtil;
import nju.secondhand.vo.TransfersResult;
import org.apache.commons.codec.digest.DigestUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.ssl.SSLConnectionSocketFactory;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.ssl.SSLContexts;
import org.apache.http.util.EntityUtils;
import org.springframework.stereotype.Service;

import javax.net.ssl.SSLContext;
import java.io.File;
import java.io.FileInputStream;
import java.lang.reflect.Field;
import java.security.KeyStore;
import java.util.Arrays;
import java.util.Comparator;
import java.util.UUID;

/**
 * @author cst
 */
@Service
public class PayServiceImpl implements PayService {
    private final MiniProgramProperties miniProgramProperties;
    private final WechatProperties wechatProperties;
    private static String SIGN = "sign";

    public PayServiceImpl(MiniProgramProperties miniProgramProperties, WechatProperties wechatProperties) {
        this.miniProgramProperties = miniProgramProperties;
        this.wechatProperties = wechatProperties;
    }

    @Override
    public TransfersResult transfers(String openid, int amount, String partner_trade_no) {
        // 构建参数，创建DTO
        TransfersDTO transfersDTO =
                TransfersDTO.builder()
                        .mch_appid(miniProgramProperties.getAppId())
                        .mchid(miniProgramProperties.getMchid())
                        .nonce_str(createNonceStr())
                        .partner_trade_no(StringUtils.isBlank(partner_trade_no) ?
                                openid.substring(openid.length() - 13) + System.currentTimeMillis() : partner_trade_no)
                        .check_name(miniProgramProperties.getCheck_name())
                        .amount(amount)
                        .desc(miniProgramProperties.getTransfers_desc())
                        .spbill_create_ip(miniProgramProperties.getIp())
                        .build();

        createSign(transfersDTO, miniProgramProperties.getApp_key());

        return transfers(transfersDTO, miniProgramProperties.getCert_path());
    }

    private String createNonceStr() {
        return UUID.randomUUID().toString().replaceAll("-", "");
    }

    @SneakyThrows
    private void createSign(TransfersDTO transfersDTO, String key) {
        Field[] fields = TransfersDTO.class.getDeclaredFields();
        String stringA = Arrays.stream(fields)
                .filter(x -> !SIGN.equals(x.getName()))
                .sorted(Comparator.comparing(Field::getName))
                .map(x -> {
                    try {
                        return x.getName() + "=" + x.get(transfersDTO);
                    } catch (Exception e) {
                        return "";
                    }
                })
                .reduce((x, y) -> String.join("&", x, y))
                .orElse("");
        String stringSignTemp = stringA + String.format("&key=%s", key);
        transfersDTO.sign = DigestUtils.md5Hex(stringSignTemp).toUpperCase();
    }

    @SneakyThrows
    private TransfersResult transfers(TransfersDTO transfersDTO, String certPath) {
        // 加载cert
        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        @Cleanup FileInputStream inputStream = new FileInputStream(new File(certPath));
        keyStore.load(inputStream, transfersDTO.mchid.toCharArray());

        SSLContext sslContext = SSLContexts.custom()
                .loadKeyMaterial(keyStore, transfersDTO.mchid.toCharArray())
                .build();
        val sslConnectionSocketFactory = new SSLConnectionSocketFactory(sslContext,
                new String[]{"TLSv1"}, null,
                SSLConnectionSocketFactory.BROWSER_COMPATIBLE_HOSTNAME_VERIFIER);
        val httpClient = HttpClients.custom().setSSLSocketFactory(sslConnectionSocketFactory).build();
        HttpPost post = new HttpPost(wechatProperties.getTransfersUrl());

        StringEntity postEntity = new StringEntity(XmlUtil.toXml(transfersDTO), "UTF-8");
        post.addHeader("Content-Type", "text/xml");
        post.setEntity(postEntity);

        try {
            @Cleanup CloseableHttpResponse response = httpClient.execute(post);
            HttpEntity responseEntity = response.getEntity();

            String xmlResult = EntityUtils.toString(responseEntity);

            return XmlUtil.fromXml(xmlResult, TransfersResult.class);
        } finally {
            post.abort();
        }
    }

    @Builder
    @Data
    static public class TransfersDTO {
        String mch_appid;
        String mchid;
        String nonce_str;
        String partner_trade_no;
        String openid;
        String check_name;
        Integer amount;
        String desc;
        String spbill_create_ip;

        String sign;
    }
}
