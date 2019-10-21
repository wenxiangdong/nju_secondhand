package nju.secondhand.controller;

import nju.secondhand.response.HttpResponse;
import nju.secondhand.service.ComplaintService;
import nju.secondhand.util.LoginUtil;
import nju.secondhand.vo.ComplaintVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.util.List;

/**
 * @author cst
 */
@RestController
public class ComplaintController {
    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping("/getComplaints")
    public HttpResponse<List<ComplaintVO>> getComplaints(@RequestParam(defaultValue = "") String keyword, @RequestParam(defaultValue = "0") int lastIndex, @RequestParam(defaultValue = "10") int size, HttpSession session) {
        LoginUtil.checkLogin(session);
        return new HttpResponse<>(complaintService.getComplaints(keyword, lastIndex, size));
    }

    @PostMapping("/handle")
    public HttpResponse<Void> handle(String complaintID, String result, HttpSession session) {
        LoginUtil.checkLogin(session);
        complaintService.handle(complaintID, result);
        return new HttpResponse<>();
    }
}
