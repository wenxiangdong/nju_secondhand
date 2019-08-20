package nju.secondhand.service;

import nju.secondhand.vo.CategoryVO;
import nju.secondhand.vo.GoodsVO;

import java.util.List;

/**
 * @author cst
 */
public interface GoodsService {
    /**
     * 取得商品分类
     *
     * @return {@link CategoryVO}
     */
    List<CategoryVO> getCategories();

    /**
     * 根据关键词取得在售商品
     *
     * @param keyword   关键词
     * @param lastIndex 之前总共查询到的数量
     * @param size      本次查询数量
     * @param timestamp 时间戳
     * @return {@link GoodsVO}
     */
    List<GoodsVO> getGoodsByKeyword(String keyword, int lastIndex, int size, long timestamp);

    /**
     * 根据商品类别取得在售商品
     *
     * @param categoryID 商品类别 ID
     * @param lastIndex  之前总共查询到的数量
     * @param size       本次查询数量
     * @param timestamp  时间戳
     * @return {@link GoodsVO}
     */
    List<GoodsVO> getGoodsByCategory(String categoryID, int lastIndex, int size, long timestamp);

    /**
     * 下架商品
     *
     * @param goodsID 商品 ID
     */
    void deleteGoods(String goodsID); // 下架商品，需要给卖家发通知
}
