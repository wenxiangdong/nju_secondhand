package nju.secondhand.service.impl;

import nju.secondhand.service.CloudService;
import nju.secondhand.service.GoodsService;
import nju.secondhand.vo.CategoryVO;
import nju.secondhand.vo.GoodsVO;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * @author cst
 */
@Service
public class GoodsServiceImpl implements GoodsService {
    private static final String CATEGORY_COLLECTION_NAME = "category";
    private static final String GOODS_COLLECTION_NAME = "goods";
    private final CloudService cloudService;

    public GoodsServiceImpl(CloudService cloudService) {
        this.cloudService = cloudService;
    }

    @Override
    public List<CategoryVO> getCategories() {
        List<CategoryVO> categoryVOs = new ArrayList<>();
        List<CategoryVO> data;
        int skip = 0;
        int limit = 10;
        do {
            data = cloudService.databaseQuery(CategoryVO.class, CATEGORY_COLLECTION_NAME, skip, limit, Collections.emptyMap());
            categoryVOs.addAll(data);
            skip += limit;
        } while (data.size() >= limit);
        return categoryVOs;
    }

    @Override
    public List<GoodsVO> getGoodsByKeyword(String keyword, int lastIndex, int size) {
        return null;
    }

    @Override
    public List<GoodsVO> getGoodsByCategory(String categoryID, int lastIndex, int size) {
        return null;
    }

    @Override
    public void deleteGoods(String goodsID) {

    }
}
