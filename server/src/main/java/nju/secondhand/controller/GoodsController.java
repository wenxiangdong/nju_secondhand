package nju.secondhand.controller;

import nju.secondhand.response.HttpResponse;
import nju.secondhand.service.GoodsService;
import nju.secondhand.util.LoginUtil;
import nju.secondhand.vo.CategoryVO;
import nju.secondhand.vo.GoodsVO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpSession;
import java.util.List;

/**
 * @author cst
 */
@RestController
public class GoodsController {
    private final GoodsService goodsService;

    public GoodsController(GoodsService goodsService) {
        this.goodsService = goodsService;
    }

    @GetMapping("/getCategories")
    public HttpResponse<List<CategoryVO>> getCategories(HttpSession session) {
//        LoginUtil.checkLogin(session);
        return new HttpResponse<>(goodsService.getCategories());
    }

    @GetMapping("/getGoodsByKeyword")
    public HttpResponse<List<GoodsVO>> getGoodsByKeyword(String keyword, int lastIndex, int size, HttpSession session) {
        LoginUtil.checkLogin(session);
        return new HttpResponse<>(goodsService.getGoodsByKeyword(keyword, lastIndex, size));
    }

    @GetMapping("/getGoodsByCategory")
    public HttpResponse<List<GoodsVO>> getGoodsByCategory(String categoryID, int lastIndex, int size, HttpSession session) {
        LoginUtil.checkLogin(session);
        return new HttpResponse<>(goodsService.getGoodsByCategory(categoryID, lastIndex, size));
    }

    @PostMapping("/deleteGoods")
    public HttpResponse<Void> deleteGoods(String goodsID, HttpSession session) {
        LoginUtil.checkLogin(session);
        goodsService.deleteGoods(goodsID);
        return new HttpResponse<>();
    }
}
