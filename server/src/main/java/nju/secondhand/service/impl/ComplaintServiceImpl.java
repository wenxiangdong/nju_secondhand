package nju.secondhand.service.impl;

import com.google.common.collect.ImmutableMap;
import nju.secondhand.service.CloudService;
import nju.secondhand.service.ComplaintService;
import nju.secondhand.vo.ComplaintVO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * @author cst
 */
@Service
public class ComplaintServiceImpl implements ComplaintService {
    private static final String COMPLAINT_API = "complaintApi";
    private final CloudService cloudService;

    public ComplaintServiceImpl(CloudService cloudService) {
        this.cloudService = cloudService;
    }

    @Override
    public List<ComplaintVO> getComplaints(String keyword, int lastIndex, int size) {
        Map<Object, Object> map =
                ImmutableMap.builder()
                        .put("$url", "getComplaintsByAdmin")
                        .put("keyword", keyword)
                        .put("lastIndex", lastIndex)
                        .put("size", size)
                        .build();
        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, COMPLAINT_API, map);
    }

    @Override
    public void handle(String complaintID, String result) {
        Map<Object, Object> map =
                ImmutableMap.builder()
                        .put("$url", "handle")
                        .put("complaintID", complaintID)
                        .put("result", result)
                        .build();
        cloudService.invokeCloudFunction(Void.class, COMPLAINT_API, map);
    }
}
