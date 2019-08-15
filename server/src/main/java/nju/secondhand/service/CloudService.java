package nju.secondhand.service;

import java.util.List;
import java.util.Map;

/**
 * @author cst
 */
public interface CloudService {
    /**
     * 调用云函数
     *
     * @param tClass 返回对象类
     * @param name   云函数名称
     * @param object 参数
     * @param <T>    对象泛型
     * @return 调用云函数结果
     */
    <T> T invokeCloudFunction(Class<T> tClass, String name, Object object);

    /**
     * 数据库查询记录
     *
     * @param tClass         返回对象类
     * @param collectionName 集合名称
     * @param conditions     筛选条件
     * @param skip           跳过多少数据量
     * @param limit          拿多少数据量
     * @param <T>            对象泛型
     * @return 查询结果集
     */
    <T> List<T> databaseQuery(Class<T> tClass, String collectionName, int skip, int limit, Map<String, Object>... conditions);

    /**
     * 更新一条记录
     *
     * @param collectionName 集合名称
     * @param id             数据 ID
     * @param newObject      新对象
     */
    void databaseUpdateOne(String collectionName, String id, Object newObject);

    /**
     * 根据文件 ID 换取真实链接
     *
     * @param fileID 文件 ID
     * @return 文件真实链接
     */
    String batchDownloadFile(String fileID);
}
