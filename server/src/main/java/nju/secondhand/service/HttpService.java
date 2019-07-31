package nju.secondhand.service;


/**
 * @author cst
 */
public interface HttpService {
    /**
     * get 方法
     *
     * @param url    请求路径
     * @param tClass 泛型类
     * @param params 参数
     * @param <T>    泛型
     * @return T
     */
    <T> T get(String url, Class<T> tClass, Object... params);

    /**
     * post 方法
     *
     * @param url    请求路径
     * @param object 请求体
     * @param tClass 泛型类
     * @param params 参数
     * @param <T>    泛型
     * @return T
     */
    <T> T post(String url, Object object, Class<T> tClass, Object... params);
}
