package nju.secondhand.service.impl;

import lombok.Builder;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.log4j.Log4j2;
import nju.secondhand.config.MiniProgramProperties;
import nju.secondhand.exception.FailException;
import nju.secondhand.service.CloudService;
import nju.secondhand.service.HttpService;
import nju.secondhand.service.WechatService;
import nju.secondhand.util.JsonUtil;
import nju.secondhand.vo.enums.ApiType;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

/**
 * @author cst
 */
@Log4j2
@Service
public class CloudServiceImpl implements CloudService {
    private final HttpService httpService;
    private final MiniProgramProperties miniProgramProperties;
    private final WechatService wechatService;

    public CloudServiceImpl(HttpService httpService, MiniProgramProperties miniProgramProperties, WechatService wechatService) {
        this.httpService = httpService;
        this.miniProgramProperties = miniProgramProperties;
        this.wechatService = wechatService;
    }

    @Override
    public <T> T invokeCloudFunction(Class<T> tClass, Object object, ApiType apiType) {
        String url = String.format("https://api.weixin.qq.com/tcb/invokecloudfunction?access_token=%s&env=%s&name=%s",
                wechatService.getAccessToken(),
                miniProgramProperties.getEnv(),
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
                wechatService.getAccessToken());

        DownLoadFileDTO downLoadFileDTO = DownLoadFileDTO.builder()
                .env(miniProgramProperties.getEnv())
                .file_list(
                        Collections.singletonList(DownLoadFileDTO.FileList.builder()
                                .fileid(fileID)
                                .max_age(7200)
                                .build()))
                .build();

        DownLoadFileResult downLoadFileResult = httpService.post(url, JsonUtil.toJson(downLoadFileDTO), DownLoadFileResult.class);

        if (downLoadFileResult.invalid()) {
            throw new FailException(downLoadFileResult.errmsg);
        }

        return downLoadFileResult.file_list.get(0).download_url;
    }

    @Builder
    @ToString
    static class DownLoadFileDTO {
        String env;
        List<FileList> file_list;

        @Builder
        static class FileList {
            String fileid;
            int max_age;
        }
    }

    @Setter
    static class FunctionResult extends WechatServiceImpl.WechatError {
        String resp_data;
    }

    @Setter
    static
    class DownLoadFileResult extends WechatServiceImpl.WechatError {
        List<FileList> file_list;

        @Setter
        static class FileList {
            String fileid;
            String download_url;
            Integer status;
            String errmsg;
        }
    }
}

