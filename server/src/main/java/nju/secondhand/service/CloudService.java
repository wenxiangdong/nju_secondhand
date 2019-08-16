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
    <T> List<T> databaseQuery(Class<T> tClass, String collectionName, int skip, int limit, Map<Object, Object>... conditions);

    /**
     * 统计查询语句对应的结果记录数
     *
     * @param collectionName 集合名称
     * @param conditions     筛选条件
     * @return 符合条件的记录数
     */
    long databaseCount(String collectionName, Map<Object, Object> conditions);

    /**
     * 根据文件 ID 换取真实链接
     *
     * @param fileID 文件 ID
     * @return 文件真实链接
     */
    String batchDownloadFile(String fileID);
}
