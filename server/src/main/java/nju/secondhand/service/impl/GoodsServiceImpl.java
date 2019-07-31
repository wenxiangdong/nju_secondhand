package nju.secondhand.service.impl;

import com.google.common.collect.ImmutableMap;
import nju.secondhand.service.CloudService;
import nju.secondhand.service.GoodsService;
import nju.secondhand.vo.CategoryVO;
import nju.secondhand.vo.GoodsVO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * @author cst
 */
@Service
public class GoodsServiceImpl implements GoodsService {
    private static final String GOODS_API = "goodsApi";
    private final CloudService cloudService;

    public GoodsServiceImpl(CloudService cloudService) {
        this.cloudService = cloudService;
    }

    @Override
    public List<CategoryVO> getCategories() {
        Map<Object, Object> map = ImmutableMap.builder()
                .put("$url", "getCategories")
                .build();
        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, GOODS_API, map);
    }

    @Override
    public List<GoodsVO> getGoodsByKeyword(String keyword, int lastIndex, int size) {
        Map<Object, Object> map = ImmutableMap.builder()
                .put("$url", "searchGoodsByKeyword")
                .put("keyword", keyword)
                .put("lastIndex", lastIndex)
                .put("size", size)
                .build();
        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, GOODS_API, map);
    }

    @Override
    public List<GoodsVO> getGoodsByCategory(String categoryID, int lastIndex, int size) {
        Map<Object, Object> map = ImmutableMap.builder()
                .put("$url", "searchGoodsByCategory")
                .put("categoryID", categoryID)
                .put("lastIndex", lastIndex)
                .put("size", size)
                .build();
        //noinspection unchecked
        return cloudService.invokeCloudFunction(List.class, GOODS_API, map);
    }

    @Override
    public void deleteGoods(String goodsID) {
        Map<Object, Object> map = ImmutableMap.builder()
                .put("$url", "deleteGoodsByAdmin")
                .put("goodsID", goodsID)
                .build();
        cloudService.invokeCloudFunction(Void.class, GOODS_API, map);
    }
}
