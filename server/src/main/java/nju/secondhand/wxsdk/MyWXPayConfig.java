package nju.secondhand.wxsdk;

import nju.secondhand.config.MiniProgramConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component
public class MyWXPayConfig extends WXPayConfig {
    private MiniProgramConfig miniProgramConfig;

    @Autowired
    public MyWXPayConfig(
            MiniProgramConfig miniProgramConfig
    ) {
        this.miniProgramConfig = miniProgramConfig;
    }

    @Override
    public String getAppID() {
        return this.miniProgramConfig.getAppId();
    }

    @Override
    public String getMchID() {
        return "1521513131";
    }

    @Override
    public String getKey() {
        return "key";
    }

    @Override
    public InputStream getCertStream() {
        return null;
    }

    @Override
    public IWXPayDomain getWXPayDomain() {
        return new MyWXPayDomain();
    }
}
