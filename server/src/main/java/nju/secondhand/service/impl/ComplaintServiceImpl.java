package nju.secondhand.service.impl;

import nju.secondhand.service.CloudService;
import nju.secondhand.service.ComplaintService;
import nju.secondhand.util.MapObjectUtil;
import nju.secondhand.util.entity.Pair;
import nju.secondhand.vo.ComplaintVO;
import nju.secondhand.vo.enums.ApiType;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author cst
 */
@Service
public class ComplaintServiceImpl implements ComplaintService {
    private final CloudService cloudService;

    public ComplaintServiceImpl(CloudService cloudService) {
        this.cloudService = cloudService;
    }

    @Override
    public List<ComplaintVO> getComplaints(String keyword, int lastIndex, int size) {
        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, MapObjectUtil.mapObject(
                Pair.of("$url", "getComplaints"),
                Pair.of("keyword", keyword),
                Pair.of("lastIndex", lastIndex),
                Pair.of("size", size)
        ), ApiType.ADMIN_API);
    }

    @Override
    public void handle(String complaintID, String result) {
        cloudService.invokeCloudFunction(Void.class, MapObjectUtil.mapObject(
                Pair.of("$url", "handle"),
                Pair.of("complaintID", complaintID),
                Pair.of("result", result)
        ), ApiType.ADMIN_API);
    }
}
