import "@tarojs/async-await"
import {mockHttpRequest, VO} from "./HttpRequest";

export interface IGoodsApi {
    // 取得商品分类
    getCategories(): Promise<CategoryVO[]>;

    // 发布闲置物品
    publishGoods(goods: GoodsDTO): Promise<void>;

    // 查看自己正在卖的物品
    getOngoingGoods(): Promise<GoodsVO[]>;

    // 下架商品
    deleteGoods(goodsId: string): Promise<void>;

    // 关键字搜索商品
    searchGoodsByKeyword(keyword: string, lastIndex: number, size?: number): Promise<GoodsVO[]>;

    // 种类搜索商品
    searchGoodsByCategory(categoryID: string, lastIndex: number, size?: number): Promise<GoodsVO[]>;

    // 购买商品
    purchase(goodsID: string): Promise<void>;
}

class GoodsApi implements IGoodsApi {

    getCategories(): Promise<CategoryVO[]> {
      throw new Error("Method not implemented.");
    }
    publishGoods(goods: GoodsDTO): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getOngoingGoods(): Promise<GoodsVO[]> {
        throw new Error("Method not implemented.");
    }
    deleteGoods(goodsId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    searchGoodsByKeyword(keyword: string, lastIndex: number, size: number = 10): Promise<GoodsVO[]> {
        throw new Error("Method not implemented.");
    }
    searchGoodsByCategory(categoryID: string, lastIndex: number, size: number = 10): Promise<GoodsVO[]> {
        throw new Error("Method not implemented.");
    }
    purchase(goodsID: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}

class MockGoodsApi implements IGoodsApi {
    getCategories(): Promise<CategoryVO[]> {
      return mockHttpRequest.success([
        {name: '数码', icon: '', _id: '1'},
        {name: '二手图书', icon: '', _id: '1'},
        {name: '服饰鞋包', icon: '', _id: '1'},
        {name: '美妆', icon: '', _id: '1'},
        {name: '二手车', icon: '', _id: '1'},
        {name: '全部分类', icon: '', _id: '1'},
      ])
    }
    publishGoods(goods: GoodsDTO): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getOngoingGoods(): Promise<GoodsVO[]> {
        throw new Error("Method not implemented.");
    }
    deleteGoods(goodsId: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    searchGoodsByKeyword(keyword: string, lastIndex: number, size: number = 10): Promise<GoodsVO[]> {
        throw new Error("Method not implemented.");
    }
    searchGoodsByCategory(categoryID: string, lastIndex: number, size: number = 10): Promise<GoodsVO[]> {
        throw new Error("Method not implemented.");
    }
    purchase(goodsID: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}

let goodsApi: IGoodsApi = new GoodsApi();
let mockGoodsApi: IGoodsApi = new MockGoodsApi();
export { goodsApi, mockGoodsApi }


export interface CategoryVO extends VO {
    name: string;
    icon: string;
}

export interface GoodsDTO {
    name: string;
    desc: string;
    price: string;
    pictures: Array<string>;
    categoryID: string; // -> Category._id
}

export interface GoodsVO extends VO {
    sellerID: string;

    name: string;
    desc: string;
    price: string;
    pictures: Array<string>;
    category: CategoryVO;

    publishTime: number;

    state: GoodsState;
}

export enum GoodsState {
    InSale,
    Deleted
}
