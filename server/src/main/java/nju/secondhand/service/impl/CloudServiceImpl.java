package nju.secondhand.service.impl;

import lombok.Builder;
import lombok.Setter;
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

    private static LocalDateTime access_token_expireTime;
    private static String access_token;

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
        if (access_token == null || LocalDateTime.now().compareTo(access_token_expireTime) >= 0) {
            String url = String.format("https://api.weixin.qq.com/cgi-bin/token?grant_type=%s&appid=%s&secret=%s",
                    "client_credential",
                    miniProgramConfig.getAppId(),
                    miniProgramConfig.getAppSecret());

            AccessToken accessToken = httpService.get(url, AccessToken.class);

            log.info("AccessToken: " + accessToken.access_token);

            if (accessToken.invalid()) {
                throw new FailException(accessToken.errmsg);
            }
            access_token_expireTime = LocalDateTime.now().plusSeconds(accessToken.expires_in);
            access_token = accessToken.access_token;
        }
        return access_token;
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

@Setter
class WechatError {
    Integer errcode;
    String errmsg;

    boolean invalid() {
        return errcode != null && errcode != 0;
    }
}

@Setter
class AccessToken extends WechatError {
    String access_token;
    Integer expires_in;
}

@Setter
class FunctionResult extends WechatError {
    String resp_data;
}

@Setter
class DownLoadFileResult extends WechatError {
    FileList file_list;

    static class FileList {
        String fileid;
        String download_url;
        Integer status;
        String errmsg;
    }
}