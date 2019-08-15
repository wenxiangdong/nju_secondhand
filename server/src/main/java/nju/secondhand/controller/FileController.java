package nju.secondhand.controller;

import nju.secondhand.response.HttpResponse;
import nju.secondhand.service.FileService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * @author cst
 */
@RestController
@CrossOrigin(value = "*", methods = {RequestMethod.GET, RequestMethod.POST}, allowCredentials = "true")
public class FileController {
    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @GetMapping("/transferUrl")
    public HttpResponse<String> transferUrl(String fileID) {
        return new HttpResponse<>(fileService.transferUrl(fileID));
    }
}
