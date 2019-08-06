import "@tarojs/async-await"
import { httpRequest, mockHttpRequest, VO, db} from "./HttpRequest";
import { MockUserApi, UserVO, userApi } from "./UserApi";

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

  // 关键字搜索商品和销售者信息
  searchGoodsWithSellerByKeyword(keyword: string, lastIndex: number, size?: number): Promise<GoodsWithSellerVO[]>;

  // 种类搜索商品和销售者信息
  searchGoodsWithSellerByCategory(categoryID: string, lastIndex: number, size?: number): Promise<GoodsWithSellerVO[]>;

  // 通过 id 获取商品和销售者信息
  getGoodsWithSeller(goodsID: string): Promise<GoodsWithSellerVO>;

  // 通过 Id 获取商品信息
  getGoods(goodsID: string): Promise<GoodsVO>;

  // 购买商品
  purchase(goodsID: string): Promise<void>;
}

const goodsCollection = db.collection('goods');
const functionName = 'goodsApi';

class GoodsApi implements IGoodsApi {
  async getCategories(): Promise<CategoryVO[]> {
    return await httpRequest.callFunction<CategoryVO[]>(functionName, { $url: 'getCategories' });
  }
  async publishGoods(goods: GoodsDTO): Promise<void> {
    return await httpRequest.callFunction<void>(functionName, { $url: 'publishGoods', goods });
  }
  async getOngoingGoods(): Promise<GoodsVO[]> {
    return await httpRequest.callFunction<GoodsVO[]>(functionName, { $url: "getOngoingGoods" });
  }
  async deleteGoods(goodsID: string): Promise<void> {

    return await httpRequest.callFunction<void>(functionName, { $url: "deleteGoods", goodsID });
  }
  async searchGoodsByKeyword(keyword: string, lastIndex: number, size: number = 10): Promise<GoodsVO[]> {
    return await httpRequest.callFunction<GoodsVO[]>(functionName, { $url: "searchGoodsByKeyword", keyword, lastIndex, size });
  }
  async searchGoodsByCategory(categoryID: string, lastIndex: number, size: number = 10): Promise<GoodsVO[]> {
    return await httpRequest.callFunction<GoodsVO[]>(functionName, { $url: "searchGoodsByCategory", categoryID, lastIndex, size });
  }
  async purchase(goodsID: string): Promise<void> {
    return await httpRequest.callFunction<void>(functionName, { $url: "purchase", goodsID });
  }

  async searchGoodsWithSellerByCategory(categoryID: string, lastIndex: number, size: number = 10): Promise<GoodsWithSellerVO[]> {
    let goodsVOs: GoodsVO[] = await this.searchGoodsByCategory(categoryID, lastIndex, size);

    let goodsWithSellerVOs: GoodsWithSellerVO[] = [];
    for (let goodsVO of goodsVOs) {
      goodsWithSellerVOs.push({
        goods: goodsVO,
        seller: await userApi.getUserInfo(goodsVO.sellerID)
      })
    }
    return goodsWithSellerVOs;
  }

  async searchGoodsWithSellerByKeyword(keyword: string, lastIndex: number, size: number = 10): Promise<GoodsWithSellerVO[]> {
    let goodsVOs: GoodsVO[] = await this.searchGoodsByKeyword(keyword, lastIndex, size);

    let goodsWithSellerVOs: GoodsWithSellerVO[] = [];
    for (let goodsVO of goodsVOs) {
      goodsWithSellerVOs.push({
        goods: goodsVO,
        seller: await userApi.getUserInfo(goodsVO.sellerID)
      })
    }
    return goodsWithSellerVOs;
  }

  getGoodsWithSeller(goodsID: string): Promise<GoodsWithSellerVO> {
    // TODO 优先级 低 接口添加
    // 求后端小哥加通过 id 获取 VO 的接口
    // 加完记得顺便改一下文档 ❤❤❤
    // 其他用 id 获取 VO 的接口暂时还不急
    throw new Error("Method not implemented." + categoryID);
  }

  getGoods(goodsID: string): Promise<GoodsVO> {
    // TODO 优先级 低 接口添加
    // 同上
    throw new Error("Method not implemented." + categoryID);
  }
}

class MockGoodsApi implements IGoodsApi {
  private goodsCount = 20;

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
      const goodsArray: GoodsVO[] = new Array(size).fill(null)
        .map(() => {
        let goods: GoodsVO = MockGoodsApi.createMockGoods();
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
      const goodsArray: GoodsVO[] = new Array(size).fill(null)
        .map(() => {
        let goods: GoodsVO = MockGoodsApi.createMockGoods();
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

  searchGoodsWithSellerByCategory(categoryID: string, lastIndex: number, size: number = 10): Promise<GoodsWithSellerVO[]> {
    if (lastIndex >= this.goodsCount) {
      return mockHttpRequest.success([]);
    } else {
      const goodsWithSellerArray: GoodsWithSellerVO[] = new Array(size).fill(null)
        .map(() => {
        let goods: GoodsVO = MockGoodsApi.createMockGoods();
        goods.category._id = categoryID;
        let seller:UserVO = MockUserApi.createMockUser();
        return {seller, goods};
      });
      return mockHttpRequest.success(goodsWithSellerArray);
    }
  }

  searchGoodsWithSellerByKeyword(keyword: string, lastIndex: number, size: number = 10): Promise<GoodsWithSellerVO[]> {
    if (lastIndex >= this.goodsCount) {
      return mockHttpRequest.success([]);
    } else {
      const goodsWithSellerArray: GoodsWithSellerVO[] = new Array(size).fill(null)
        .map(() => {
        let goods: GoodsVO = MockGoodsApi.createMockGoods();
        goods.name += keyword;
        let seller:UserVO = MockUserApi.createMockUser();
        return {seller, goods};
      });
      return mockHttpRequest.success(goodsWithSellerArray);
    }
  }

  getGoodsWithSeller(goodsID: string): Promise<GoodsWithSellerVO> {
    let goodsWithSeller = MockGoodsApi.createMockGoodsWithSeller();
    goodsWithSeller.goods._id = goodsID;
    goodsWithSeller.seller._id = goodsID;
    return mockHttpRequest.success(goodsWithSeller);
  }

  getGoods(goodsID: string): Promise<GoodsVO> {
    let goods = MockGoodsApi.createMockGoods();
    goods._id = goodsID;
    return goods;
  }

  static createMockCateGory(): CategoryVO {
    return {
      _id: '1',
      name: 'category',
      icon: ''
    };
  }

  static createMockGoods(): GoodsVO {
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

  // TODO 优先级 低
  // 设置为 private
  static createMockGoodsWithSeller(): GoodsWithSellerVO {
    return {
      goods: MockGoodsApi.createMockGoods(),
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
