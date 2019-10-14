package nju.secondhand.service.impl;

import nju.secondhand.service.CloudService;
import nju.secondhand.service.GoodsService;
import nju.secondhand.util.MapObjectUtil;
import nju.secondhand.vo.CategoryVO;
import nju.secondhand.vo.GoodsVO;
import nju.secondhand.vo.enums.ApiType;
import org.apache.http.message.BasicNameValuePair;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author cst
 */
@Service
public class GoodsServiceImpl implements GoodsService {
    private final CloudService cloudService;

    public GoodsServiceImpl(CloudService cloudService) {
        this.cloudService = cloudService;
    }

    @Override
    public List<CategoryVO> getCategories() {
        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, MapObjectUtil.mapObject(
                new BasicNameValuePair("$url", "getCategories")), ApiType.ADMIN_API);
    }

    @Override
    public List<GoodsVO> getGoodsByKeyword(String keyword, int lastIndex, int size) {
        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, MapObjectUtil.mapObject(
                new BasicNameValuePair("$url", "searchGoodsByKeyword"),
                new BasicNameValuePair("keyword", keyword),
                new BasicNameValuePair("lastIndex", String.valueOf(lastIndex)),
                new BasicNameValuePair("size", String.valueOf(size))
        ), ApiType.ADMIN_API);
    }

    @Override
    public List<GoodsVO> getGoodsByCategory(String categoryID, int lastIndex, int size) {
        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, MapObjectUtil.mapObject(
                new BasicNameValuePair("$url", "searchGoodsByCategory"),
                new BasicNameValuePair("categoryID", categoryID),
                new BasicNameValuePair("lastIndex", String.valueOf(lastIndex)),
                new BasicNameValuePair("size", String.valueOf(size))
        ), ApiType.ADMIN_API);
    }

    @Override
    public void deleteGoods(String goodsID) {
        cloudService.invokeCloudFunction(Void.class, MapObjectUtil.mapObject(
                new BasicNameValuePair("$url", "deleteGoods"),
                new BasicNameValuePair("goodsID", goodsID)
        ), ApiType.ADMIN_API);
    }
}
