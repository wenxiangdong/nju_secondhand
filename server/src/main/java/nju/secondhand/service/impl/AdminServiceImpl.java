package nju.secondhand.service.impl;

import nju.secondhand.service.AdminService;
import nju.secondhand.service.CloudService;
import nju.secondhand.util.MapObjectUtil;
import nju.secondhand.util.Pair;
import nju.secondhand.vo.enums.ApiType;
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
                Pair.of("$url", "checkAdmin"),
                Pair.of("username", username),
                Pair.of("password", password)
        ), ApiType.ADMIN_API);
    }
}
