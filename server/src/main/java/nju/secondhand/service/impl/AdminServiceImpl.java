package nju.secondhand.service.impl;

import nju.secondhand.service.AdminService;
import nju.secondhand.service.CloudService;
import nju.secondhand.util.MapObjectUtil;
import nju.secondhand.vo.enums.ApiType;
import org.apache.http.message.BasicNameValuePair;
import org.springframework.stereotype.Service;

/**
 * @author cst
 */
@Service
public class AdminServiceImpl implements AdminService {
    private final CloudService cloudService;

    public AdminServiceImpl(CloudService cloudService) {
        this.cloudService = cloudService;
    }

    @Override
    public boolean existsUsernameAndPassword(String username, String password) {
        return cloudService.invokeCloudFunction(Boolean.class, MapObjectUtil.mapObject(
                new BasicNameValuePair("$url", "checkAdmin"),
                new BasicNameValuePair("username", username),
                new BasicNameValuePair("password", password)
        ), ApiType.ADMIN_API);
    }

}
