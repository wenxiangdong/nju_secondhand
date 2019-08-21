package nju.secondhand.service.impl;

import nju.secondhand.service.CloudService;
import nju.secondhand.service.GoodsService;
import nju.secondhand.util.MapObjectUtil;
import nju.secondhand.util.Pair;
import nju.secondhand.vo.CategoryVO;
import nju.secondhand.vo.GoodsVO;
import nju.secondhand.vo.enums.ApiType;
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
                Pair.of("$url", "getCategories")), ApiType.ADMIN_API);
    }

    @Override
    public List<GoodsVO> getGoodsByKeyword(String keyword, int lastIndex, int size) {
        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, MapObjectUtil.mapObject(
                Pair.of("$url", "searchGoodsByKeyword"),
                Pair.of("keyword", keyword),
                Pair.of("lastIndex", lastIndex),
                Pair.of("size", size)
        ), ApiType.ADMIN_API);
    }

    @Override
    public List<GoodsVO> getGoodsByCategory(String categoryID, int lastIndex, int size) {
        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, MapObjectUtil.mapObject(
                Pair.of("$url", "searchGoodsByCategory"),
                Pair.of("categoryID", categoryID),
                Pair.of("lastIndex", lastIndex),
                Pair.of("size", size)
        ), ApiType.ADMIN_API);
    }

    @Override
    public void deleteGoods(String goodsID) {
        cloudService.invokeCloudFunction(Void.class, MapObjectUtil.mapObject(
                Pair.of("$url", "deleteGoods"),
                Pair.of("goodsID", goodsID)
        ), ApiType.ADMIN_API);
    }
}
