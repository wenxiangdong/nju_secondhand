package nju.secondhand.controller;

import nju.secondhand.response.HttpResponse;
import nju.secondhand.service.FileService;
import nju.secondhand.util.LoginUtil;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;

/**
 * @author cst
 */
@RestController
public class FileController {
    private final FileService fileService;

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @GetMapping("/transferUrl")
    public HttpResponse<String> transferUrl(String fileID, HttpSession session) {
//        LoginUtil.checkLogin(session);
        return new HttpResponse<>(fileService.transferUrl(fileID));
    }
}
