package nju.secondhand.service.impl;

import com.google.gson.Gson;
import lombok.Builder;
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

    private LocalDateTime accessTokenExpireTime;
    private String accessToken;

    public CloudServiceImpl(HttpService httpService, MiniProgramConfig miniProgramConfig) {
        this.httpService = httpService;
        this.miniProgramConfig = miniProgramConfig;
    }

    @Override
    public <T> T invokeCloudFunction(Class<T> tClass, String name, Object object) {
        String url = String.format("https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=%s&env=%s&name=%s",
                getAccessToken(),
                miniProgramConfig.getEnv(),
                name);

        FunctionParam functionParam = FunctionParam
                .builder()
                .POSTBODY(new Gson().toJson(object))
                .build();

        FunctionResult result = httpService.post(url, functionParam, FunctionResult.class);

        if (result.errcode != 0) {
            throw new FailException(result.errmsg);
        }

        return new Gson().fromJson(result.resp_data, tClass);
    }

    @SafeVarargs
    @Override
    public final <T> List<T> databaseQuery(Class<T> tClass, String collectionName, int skip, int limit, Map<String, Object>... conditions) {
        log.info(String.format("Query: %s", collectionName));
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

        QueryResult result = httpService.post(url, databaseParam, QueryResult.class);

        if (result.errcode != 0) {
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

        UpdateResult result = httpService.post(url, databaseParam, UpdateResult.class);

        if (result.errcode != 0) {
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

            if (access_token.errcode != 0) {
                throw new FailException(access_token.errmsg);
            }
            this.accessTokenExpireTime = LocalDateTime.now().plusSeconds(access_token.expires_in);
            this.accessToken = access_token.access_token;

            log.info(String.format("Get AccessToken: %s", this.accessToken));
        }
        return this.accessToken;
    }
}

class AccessToken {
    String access_token;
    Integer expires_in;
    Integer errcode;
    String errmsg;
}

@Builder
class FunctionParam {
    String POSTBODY;
}

class FunctionResult {
    Integer errcode;
    String errmsg;
    String resp_data;
}

@Builder
class DatabaseParam {
    String env;
    String query;
}

class QueryResult {
    Integer errcode;
    String errmsg;
    Pager pager;

    private static class Pager {
        Integer Offset;
        Integer Limit;
        Integer Total;
    }

    List<String> data;
}

class UpdateResult {
    Integer errcode;
    String errmsg;
    Integer matched;
    Integer modified;
    String id;
}