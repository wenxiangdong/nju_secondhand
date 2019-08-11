package nju.secondhand.service.impl;

import com.google.gson.Gson;
import lombok.Builder;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.log4j.Log4j2;
import nju.secondhand.config.MiniProgramConfig;
import nju.secondhand.exception.FailException;
import nju.secondhand.service.CloudService;
import nju.secondhand.service.HttpService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

        FunctionResult result = httpService.post(url, new Gson().toJson(object), FunctionResult.class);

        log.info("Function Result: " + result);

        if (result.invalid()) {
            throw new FailException(result.errmsg);
        }

        HttpResponse<T> httpResponse = new Gson().fromJson(result.resp_data, HttpResponse.class);
        if (httpResponse.code == 200) {
            return httpResponse.data;
        } else {
            throw new FailException(httpResponse.message);
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
                        String.format(".where(_or(%s))", new Gson().toJson(conditions)) : "",
                skip,
                limit);

        DatabaseParam databaseParam = DatabaseParam.builder()
                .env(miniProgramConfig.getEnv())
                .query(query)
                .build();

        QueryResult result = httpService.post(url, new Gson().toJson(databaseParam), QueryResult.class);

        log.info("Query Result: " + result);

        if (result.invalid()) {
            throw new FailException(result.errmsg);
        }

        return result.data
                .stream()
                .map(json -> new Gson().fromJson(json, tClass))
                .collect(Collectors.toList());
    }

    @Override
    public void databaseUpdateOne(String collectionName, String id, Object newObject) {
        log.info(String.format("UpdateOne: %s-%s", collectionName, id));

        String url = String.format("https://api.weixin.qq.com/tcb/databaseupdate?access_token=%s",
                getAccessToken());

        String query = String.format("db.collection('%s').doc('%s').update(%s)",
                collectionName,
                id,
                new Gson().toJson(newObject));

        DatabaseParam databaseParam = DatabaseParam.builder()
                .env(miniProgramConfig.getEnv())
                .query(query)
                .build();

        UpdateResult result = httpService.post(url, new Gson().toJson(databaseParam), UpdateResult.class);

        log.info("Update Result: " + result.toString());

        if (result.invalid()) {
            throw new FailException(result.errmsg);
        }
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

@ToString
@Setter
class WechatError {
    Integer errcode;
    String errmsg;

    boolean invalid() {
        return errcode != null && errcode != 0;
    }
}

@ToString(callSuper = true)
@Setter
class AccessToken extends WechatError {
    String access_token;
    Integer expires_in;
}

class HttpResponse<T> {
    Integer code;
    String message;
    T data;
}

@ToString(callSuper = true)
@Setter
class FunctionResult extends WechatError {
    String resp_data;
}

@ToString(callSuper = true)
@Setter
class QueryResult extends WechatError {
    Pager pager;

    private static class Pager {
        Integer Offset;
        Integer Limit;
        Integer Total;
    }

    List<String> data;
}

@ToString(callSuper = true)
@Setter
class UpdateResult extends WechatError {
    Integer matched;
    Integer modified;
    String id;
}