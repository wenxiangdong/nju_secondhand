package nju.secondhand.service.impl;

import lombok.Builder;
import lombok.extern.log4j.Log4j2;
import nju.secondhand.config.MiniProgramConfig;
import nju.secondhand.exception.FailException;
import nju.secondhand.service.CloudService;
import nju.secondhand.service.HttpService;
import nju.secondhand.util.JsonUtil;
import nju.secondhand.vo.enums.ApiType;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * @author cst
 */
@Log4j2
@Service
public class CloudServiceImpl implements CloudService {
    private final HttpService httpService;
    private final MiniProgramConfig miniProgramConfig;

    private static LocalDateTime accessTokenExpireTime;
    private static String accessToken;

    public CloudServiceImpl(HttpService httpService, MiniProgramConfig miniProgramConfig) {
        this.httpService = httpService;
        this.miniProgramConfig = miniProgramConfig;
    }

    @Override
    public <T> T invokeCloudFunction(Class<T> tClass, Object object, ApiType apiType) {
        String url = String.format("https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=%s&env=%s&name=%s",
                getAccessToken(),
                miniProgramConfig.getEnv(),
                apiType.getApiName());

        FunctionResult result = httpService.post(url, JsonUtil.toJson(object), FunctionResult.class);

        if (result.invalid()) {
            throw new FailException(result.errmsg);
        }

        return JsonUtil.fromJson(result.resp_data, tClass);
    }

    @Override
    public String batchDownloadFile(String fileID) {
        log.info("batchDownloadFile: " + fileID);

        String url = String.format("https://api.weixin.qq.com/tcb/batchdownloadfile?access_token=%s",
                getAccessToken());

        DownLoadFileParam downLoadFileParam = DownLoadFileParam.builder()
                .env(miniProgramConfig.getEnv())
                .file_list(
                        Collections.singletonList(DownLoadFileParam.FileList.builder()
                                .fileid(fileID)
                                .max_age(7200)
                                .build()))
                .build();

        DownLoadFileResult downLoadFileResult = httpService.post(url, JsonUtil.toJson(downLoadFileParam), DownLoadFileResult.class);

        if (downLoadFileResult.invalid()) {
            throw new FailException(downLoadFileResult.errmsg);
        }

        return downLoadFileResult.file_list.download_url;
    }

    private String getAccessToken() {
        if (accessToken == null || LocalDateTime.now().compareTo(accessTokenExpireTime) >= 0) {
            String url = String.format("https://api.weixin.qq.com/cgi-bin/token?grant_type=%s&appid=%s&secret=%s",
                    "client_credential",
                    miniProgramConfig.getAppId(),
                    miniProgramConfig.getAppSecret());

            AccessToken access_token = httpService.get(url, AccessToken.class);

            log.info("AccessToken: " + access_token);

            if (access_token.invalid()) {
                throw new FailException(access_token.errmsg);
            }
            accessTokenExpireTime = LocalDateTime.now().plusSeconds(access_token.expires_in);
            accessToken = access_token.access_token;
        }
        return accessToken;
    }
}

@Builder
class DownLoadFileParam {
    String env;
    List<FileList> file_list;

    @Builder
    static class FileList {
        String fileid;
        int max_age;
    }
}

class WechatError {
    Integer errcode;
    String errmsg;

    boolean invalid() {
        return errcode != null && errcode != 0;
    }
}

class AccessToken extends WechatError {
    String access_token;
    Integer expires_in;
}

class FunctionResult extends WechatError {
    String resp_data;
}

class DownLoadFileResult extends WechatError {
    FileList file_list;

    static class FileList {
        String fileid;
        String download_url;
        Integer status;
        String errmsg;
    }
}