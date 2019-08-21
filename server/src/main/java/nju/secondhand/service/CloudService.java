package nju.secondhand.service;

import nju.secondhand.vo.enums.ApiType;

/**
 * @author cst
 */
public interface CloudService {
    /**
     * 调用云函数
     *
     * @param tClass 返回对象类
     * @param object 参数
     * @param <T>    对象泛型
     * @return 调用云函数结果
     */
    <T> T invokeCloudFunction(Class<T> tClass, Object object, ApiType apiType);

    /**
     * 根据文件 ID 换取真实链接
     *
     * @param fileID 文件 ID
     * @return 文件真实链接
     */
    String batchDownloadFile(String fileID);
}
