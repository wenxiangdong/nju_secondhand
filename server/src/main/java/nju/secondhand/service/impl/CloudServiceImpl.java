package nju.secondhand.service.impl;

import lombok.Builder;
import lombok.extern.log4j.Log4j2;
import nju.secondhand.config.MiniProgramConfig;
import nju.secondhand.exception.FailException;
import nju.secondhand.exception.SystemException;
import nju.secondhand.service.CloudService;
import nju.secondhand.service.HttpService;
import nju.secondhand.util.JsonUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    public <T> T invokeCloudFunction(Class<T> tClass, String name, Object object) {
        log.info("Invoke: " + name);
        String url = String.format("https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=%s&env=%s&name=%s",
                getAccessToken(),
                miniProgramConfig.getEnv(),
                name);

        FunctionResult result = httpService.post(url, JsonUtil.toJson(object), FunctionResult.class);

        if (result.invalid()) {
            throw new FailException(result.errmsg);
        }

        @SuppressWarnings("unchecked")
        CloudHttpResponse<T> httpResponse = JsonUtil.fromJson(result.resp_data, CloudHttpResponse.class);
        if (httpResponse.code == 200) {
            return httpResponse.data;
        } else {
            throw new SystemException(httpResponse.code, httpResponse.message);
        }
    }

    @SafeVarargs
    @Override
    public final <T> List<T> databaseQuery(Class<T> tClass, String collectionName, int skip, int limit, Map<String, Object>... conditions) {
        log.info("Query: " + collectionName);
        String url = String.format("https://api.weixin.qq.com/tcb/databasequery?access_token=%s",
                getAccessToken());

        String query = String.format("db.collection('%s')%s.skip(%d).limit(%d).get()",
                collectionName,
                conditions.length != 0 ?
                        String.format(".where(_or(%s))", JsonUtil.toJson(conditions)) : "",
                skip,
                limit);

        DatabaseParam databaseParam = DatabaseParam.builder()
                .env(miniProgramConfig.getEnv())
                .query(query)
                .build();

        QueryResult result = httpService.post(url, JsonUtil.toJson(databaseParam), QueryResult.class);

        if (result.invalid()) {
            throw new FailException(result.errmsg);
        }

        return result.data
                .stream()
                .map(json -> JsonUtil.fromJson(json, tClass))
                .collect(Collectors.toList());
    }

    @SafeVarargs
    @Override
    public final long databaseCount(String collectionName, Map<String, Object>... conditions) {
        log.info("Count: " + collectionName);
        String url = String.format("https://api.weixin.qq.com/tcb/databasecount?access_token=%s",
                getAccessToken());

        String query = String.format("db.collection('%s')%s.count()",
                collectionName,
                conditions.length != 0 ?
                        String.format(".where(_or(%s))", JsonUtil.toJson(conditions)) : "");

        DatabaseParam databaseParam = DatabaseParam.builder()
                .env(miniProgramConfig.getEnv())
                .query(query)
                .build();

        CountResult result = httpService.post(url, JsonUtil.toJson(databaseParam), CountResult.class);

        if (result.invalid()) {
            throw new FailException(result.errmsg);
        }

        return result.count;
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
class DatabaseParam {
    String env;
    String query;
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

class CloudHttpResponse<T> {
    Integer code;
    String message;
    T data;
}

class FunctionResult extends WechatError {
    String resp_data;
}

class QueryResult extends WechatError {
    Pager pager;

    static class Pager {
        Integer Offset;
        Integer Limit;
        Integer Total;
    }

    List<String> data;
}

class CountResult extends WechatError {
    Long count;
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