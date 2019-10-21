package nju.secondhand.service;

/**
 * @author cst
 */
public interface FileService {
    /**
     * 根据文件 ID 换取真实链接
     *
     * @param fileID 文件 ID
     * @return 文件真实链接
     */
    String transferUrl(String fileID);
}
