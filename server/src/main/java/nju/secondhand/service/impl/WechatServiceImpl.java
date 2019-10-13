package nju.secondhand.service.impl;

import lombok.Setter;
import nju.secondhand.config.MiniProgramProperties;
import nju.secondhand.exception.FailException;
import nju.secondhand.service.HttpService;
import nju.secondhand.service.WechatService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * @author cst
 */
@Service
public class WechatServiceImpl implements WechatService {
    private static LocalDateTime access_token_expireTime;
    private static String access_token;

    private final HttpService httpService;
    private final MiniProgramProperties miniProgramProperties;

    public WechatServiceImpl(HttpService httpService, MiniProgramProperties miniProgramProperties) {
        this.httpService = httpService;
        this.miniProgramProperties = miniProgramProperties;
    }

    @Override
    public String getAccessToken() {

        if (access_token == null || LocalDateTime.now().compareTo(access_token_expireTime) >= 0) {
            String url = String.format("https://api.weixin.qq.com/cgi-bin/token?grant_type=%s&appid=%s&secret=%s",
                    "client_credential",
                    miniProgramProperties.getAppId(),
                    miniProgramProperties.getAppSecret());

            AccessToken accessToken = httpService.get(url, AccessToken.class);

            if (accessToken.invalid()) {
                throw new FailException(accessToken.errmsg);
            }
            access_token_expireTime = LocalDateTime.now().plusSeconds(accessToken.expires_in);
            access_token = accessToken.access_token;
        }
        return access_token;
    }

    @Setter
    static
    class AccessToken extends WechatError {
        String access_token;
        Integer expires_in;
    }

    @Setter
    static
    class WechatError {
        Integer errcode;
        String errmsg;

        boolean invalid() {
            return errcode != null && errcode != 0;
        }
    }
}
