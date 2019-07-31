package nju.secondhand.service.impl;

import com.google.common.collect.ImmutableMap;
import nju.secondhand.service.CloudService;
import nju.secondhand.service.ComplaintService;
import nju.secondhand.vo.ComplaintVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * @author cst
 */
@Service
public class ComplaintServiceImpl implements ComplaintService {
    private static final String COMPLAINT_API = "complaintApi";
    private static final String COMPLAINT_COLLECTION_NAME = "complaint";
    private final CloudService cloudService;

    @Autowired
    public ComplaintServiceImpl(CloudService cloudService) {
        this.cloudService = cloudService;
    }

    @Override
    public List<ComplaintVO> getComplaints(String keyword, int lastIndex, int size) {
        Map<Object, Object> map =
                ImmutableMap.builder()
                        .put("$url", "getComplaints")
                        .put("data", ImmutableMap.builder()
                                .put("keyword", keyword)
                                .put("lastIndex", lastIndex)
                                .put("size", size)
                                .build())
                        .build();
        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, COMPLAINT_API, map);
    }

    @Override
    public void handle(String complaintID, String result) {
        Map<Object, Object> map =
                ImmutableMap.builder()
                        .put("handling", ImmutableMap.builder()
                                .put("time", System.currentTimeMillis())
                                .put("result", result)
                                .build())
                        .build();
        cloudService.databaseUpdateOne(COMPLAINT_COLLECTION_NAME, complaintID, map);
    }
}
