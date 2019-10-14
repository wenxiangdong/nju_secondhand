package nju.secondhand.service.impl;

import nju.secondhand.service.CloudService;
import nju.secondhand.service.ComplaintService;
import nju.secondhand.util.MapObjectUtil;
import nju.secondhand.vo.ComplaintVO;
import nju.secondhand.vo.enums.ApiType;
import org.apache.http.message.BasicNameValuePair;
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
                new BasicNameValuePair("$url", "getComplaints"),
                new BasicNameValuePair("keyword", keyword),
                new BasicNameValuePair("lastIndex", String.valueOf(lastIndex)),
                new BasicNameValuePair("size", String.valueOf(size))
        ), ApiType.ADMIN_API);
    }

    @Override
    public void handle(String complaintID, String result) {
        cloudService.invokeCloudFunction(Void.class, MapObjectUtil.mapObject(
                new BasicNameValuePair("$url", "handle"),
                new BasicNameValuePair("complaintID", complaintID),
                new BasicNameValuePair("result", result)
        ), ApiType.ADMIN_API);
    }
}
