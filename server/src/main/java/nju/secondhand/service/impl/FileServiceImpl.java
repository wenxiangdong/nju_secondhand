package nju.secondhand.service.impl;

import nju.secondhand.service.CloudService;
import nju.secondhand.service.FileService;
import org.springframework.stereotype.Service;


/**
 * @author cst
 */
@Service
public class FileServiceImpl implements FileService {
    private final CloudService cloudService;

    public FileServiceImpl(CloudService cloudService) {
        this.cloudService = cloudService;
    }

    @Override
    public String transferUrl(String fileID) {
        return cloudService.batchDownloadFile(fileID);
    }
}
