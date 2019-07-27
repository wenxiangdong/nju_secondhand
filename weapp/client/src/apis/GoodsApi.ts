import "@tarojs/async-await"
import {httpRequest, mockHttpRequest, VO, db, command} from "./HttpRequest";
import {MockUserApi, UserVO} from "./UserApi";
import { copy } from "./Util";

export interface IGoodsApi {
  // 取得商品分类
  getCategories(): Promise<CategoryVO[]>;

  // 发布闲置物品
  publishGoods(goods: GoodsDTO): Promise<void>;

  // 查看自己正在卖的物品
  getOngoingGoods(): Promise<GoodsVO[]>;

  // 下架商品
  deleteGoods(goodsID: string): Promise<void>;

  // 关键字搜索商品
  searchGoodsByKeyword(keyword: string, lastIndex: number, size?: number): Promise<GoodsVO[]>;

  // 种类搜索商品
  searchGoodsByCategory(categoryID: string, lastIndex: number, size?: number): Promise<GoodsVO[]>;

  // 购买商品
  purchase(goodsID: string): Promise<void>;
}

let categoryCollection = db.collection("category");
let goodsCollection = db.collection("goods");

class GoodsApi implements IGoodsApi {
  async getCategories(): Promise<CategoryVO[]> {
    let categories: CategoryVO[] = [];
    let skip = 0;
    const limit = 20;

    let data: Array<any>;
    while (data = (await categoryCollection
      .skip(skip)
      .limit(limit)
      .get())
      .data) {

      categories = categories.concat(data)

      if (data.length < limit) {
        break;
      }

      skip += limit;
    }

    return categories;
  }
  async publishGoods(goods: GoodsDTO): Promise<void> {
    return await httpRequest.callFunction<void>("publishGoods", { goods });
  }
  async getOngoingGoods(): Promise<GoodsVO[]> {
    return await httpRequest.callFunction<GoodsVO[]>("getOngoingGoods");
  }
  async deleteGoods(goodsID: string): Promise<void> {
    return await httpRequest.callFunction<void>("deleteGoods", { goodsID });
  }
  async searchGoodsByKeyword(keyword: string, lastIndex: number, size: number = 10): Promise<GoodsVO[]> {
    return copy<GoodsVO[]>((await goodsCollection
      .where(
        command
          .or([
            // @ts-ignore
            { name: db.RegExp({ regexp: keyword, options: 'i', }) },
            {
              category: {
                // @ts-ignore
                name: db.RegExp({ regexp: keyword, options: 'i' })
              }
            }
          ])
          .and({ state: GoodsState.InSale })
      )
      .skip(lastIndex)
      .limit(size)
      .get())
      .data)

  }
  async searchGoodsByCategory(categoryID: string, lastIndex: number, size: number = 10): Promise<GoodsVO[]> {
    return copy<GoodsVO[]>((await goodsCollection
      .where({
        category: {
          _id: categoryID
        },
        state: GoodsState.InSale
      })
      .skip(lastIndex)
      .limit(size)
      .get())
      .data)
  }
  async purchase(goodsID: string): Promise<void> {
    return await httpRequest.callFunction<void>("purchase", { goodsID });
  }
}

class MockGoodsApi implements IGoodsApi {
  private goodsCount = 50;

  getCategories(): Promise<CategoryVO[]> {
    const names = ['数码', '二手图书', '服饰鞋包', '美妆', '二手车', '全部分类'];
    const categories: CategoryVO[] = names.map((name, idx) => {
      let category = MockGoodsApi.createMockCateGory();
      category._id = idx.toString();
      category.name = name;
      return category;
    });
    return mockHttpRequest.success(categories);
  }
  publishGoods(goods: GoodsDTO): Promise<void> {
    console.log('publishGoods goods:', goods);
    return mockHttpRequest.success();
  }
  getOngoingGoods(): Promise<GoodsVO[]> {
    throw new Error("Method not implemented.");
  }
  deleteGoods(goodsID: string): Promise<void> {
    console.log('deleteGoods goodsID:', goodsID);
    return mockHttpRequest.success();
  }
  searchGoodsByKeyword(keyword: string, lastIndex: number, size: number = 10): Promise<GoodsVO[]> {
    if (lastIndex >= this.goodsCount) {
      return mockHttpRequest.success([]);
    } else {
      const goodsArray: GoodsVO[] = new Array(size).map(() => {
        let goods: GoodsVO = MockGoodsApi.createMockGoodsVO();
        goods.name += keyword;
        return goods;
      });
      return mockHttpRequest.success(goodsArray);
    }
  }
  searchGoodsByCategory(categoryID: string, lastIndex: number, size: number = 10): Promise<GoodsVO[]> {
    if (lastIndex >= this.goodsCount) {
      return mockHttpRequest.success([]);
    } else {
      const goodsArray: GoodsVO[] = new Array(size).map(() => {
        let goods: GoodsVO = MockGoodsApi.createMockGoodsVO();
        goods.category._id = categoryID;
        return goods;
      });
      return mockHttpRequest.success(goodsArray);
    }
  }
  purchase(goodsID: string): Promise<void> {
    console.log('purchase goodsID:', goodsID);
    return mockHttpRequest.success();
  }

  private static createMockCateGory(): CategoryVO {
    return {
      _id: '1',
      name: 'category',
      icon: ''
    };
  }

  private static createMockGoodsVO(): GoodsVO {
    return {
      _id: '1',
      sellerID: '',
      name: 'name',
      desc: 'desc',
      price: '1.01',
      pictures: ['', ''],
      category: MockGoodsApi.createMockCateGory(),
      publishTime: Date.now(),
      state: GoodsState.InSale
    };
  }

  static createMockGoodsWithSeller(): GoodsWithSellerVO {
    return {
      goods: MockGoodsApi.createMockGoodsVO(),
      seller: MockUserApi.createMockUser()
    };
  }
}

let goodsApi: IGoodsApi = new GoodsApi();
let mockGoodsApi: IGoodsApi = new MockGoodsApi();
export { goodsApi, mockGoodsApi, MockGoodsApi }


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

export interface GoodsWithSellerVO {
  seller: UserVO;
  goods: GoodsVO
}

export enum GoodsState {
  InSale,
  Deleted
}
