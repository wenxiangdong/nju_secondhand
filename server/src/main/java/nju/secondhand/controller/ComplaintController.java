package nju.secondhand.controller;

import nju.secondhand.response.HttpResponse;
import nju.secondhand.service.ComplaintService;
import nju.secondhand.vo.ComplaintVO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author cst
 */
@RestController
@CrossOrigin(value = "*", methods = {RequestMethod.GET, RequestMethod.POST}, allowCredentials = "true")
public class ComplaintController {
    private final ComplaintService complaintService;

    public ComplaintController(ComplaintService complaintService) {
        this.complaintService = complaintService;
    }

    @GetMapping("/getComplaints")
    public HttpResponse<List<ComplaintVO>> getComplaints(String keyword, int lastIndex, int size) {
        return new HttpResponse<>(complaintService.getComplaints(keyword, lastIndex, size));
    }

    @PostMapping("/handle")
    public HttpResponse<Void> handle(String complaintID, String result) {
        complaintService.handle(complaintID, result);
        return new HttpResponse<>();
    }
}
