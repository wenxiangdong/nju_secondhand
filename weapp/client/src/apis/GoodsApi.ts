import "@tarojs/async-await"
import { httpRequest, mockHttpRequest, VO, db} from "./HttpRequest";
import { MockUserApi, UserVO } from "./UserApi";
import {createRandomNumberStr} from "./Util";
import localConfig from "../utils/local-config";

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
  searchGoodsByKeyword(keyword: string, lastIndex: number, size: number): Promise<GoodsVO[]>;

  // 种类搜索商品
  searchGoodsByCategory(categoryID: string, lastIndex: number, size: number): Promise<GoodsVO[]>;

  // 关键字搜索商品和销售者信息
  searchGoodsWithSellerByKeyword(keyword: string, lastIndex: number, size: number): Promise<GoodsWithSellerVO[]>;

  // 种类搜索商品和销售者信息
  searchGoodsWithSellerByCategory(categoryID: string, lastIndex: number, size: number): Promise<GoodsWithSellerVO[]>;

  // 通过 id 获取商品和销售者信息
  getGoodsWithSeller(goodsID: string): Promise<GoodsWithSellerVO>;

  // 通过 Id 获取商品信息
  getGoods(goodsID: string): Promise<GoodsVO>;

  // 购买商品
  purchase(goodsID: string): Promise<PurchaseResult>;

  // 获取浏览过的商品和销售者信息
  getVisitedGoodsWithSeller(keyword: string, lastIndex: number): Promise<GoodsWithSellerVO[]>;
}

function getVisitedGoodsWithSeller(keyword: string, lastIndex: number): Promise<GoodsWithSellerVO[]> {
  const goodsWithSellerArray = localConfig.getVisitedGoodsWithSeller().filter((goodsWithSeller) => {
    const {goods, seller} = goodsWithSeller;
    const {name, category} = goods;
    const {nickname, address} = seller;
    return name.includes(keyword) || category.name.includes(keyword)
      || nickname.includes(keyword) || address.name.includes(keyword);
  });
  return Promise.resolve(goodsWithSellerArray.slice(lastIndex, lastIndex + 10));
}

const functionName = 'api';

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
  async searchGoodsByKeyword(keyword: string, lastIndex: number, size: number): Promise<GoodsVO[]> {
    return await httpRequest.callFunction<GoodsVO[]>(functionName, { $url: "searchGoodsByKeyword", keyword, lastIndex, size });
  }
  async searchGoodsByCategory(categoryID: string, lastIndex: number, size: number): Promise<GoodsVO[]> {
    return await httpRequest.callFunction<GoodsVO[]>(functionName, { $url: "searchGoodsByCategory", categoryID, lastIndex, size });
  }
  async purchase(goodsID: string): Promise<PurchaseResult> {
    return await httpRequest.callFunction<PurchaseResult>(functionName, { $url: "purchase", goodsID });
  }

  async searchGoodsWithSellerByCategory(categoryID: string, lastIndex: number, size: number): Promise<GoodsWithSellerVO[]> {
    return await httpRequest.callFunction<GoodsWithSellerVO[]>(functionName, { $url: 'searchGoodsWithSellerByCategory', categoryID, lastIndex, size })
  }

  async searchGoodsWithSellerByKeyword(keyword: string, lastIndex: number, size: number): Promise<GoodsWithSellerVO[]> {
    return await httpRequest.callFunction<GoodsWithSellerVO[]>(functionName, { $url: 'searchGoodsWithSellerByKeyword', keyword, lastIndex, size })
  }

  async getGoodsWithSeller(goodsID: string): Promise<GoodsWithSellerVO> {
    return await httpRequest.callFunction<GoodsWithSellerVO>(functionName, { $url: 'getGoodsWithSeller', goodsID })
  }

  async  getGoods(goodsID: string): Promise<GoodsVO> {
    return await httpRequest.callFunction<GoodsVO>(functionName, { $url: "getGoods", goodsID })
  }

  getVisitedGoodsWithSeller(keyword: string, lastIndex: number): Promise<GoodsWithSellerVO[]> {
    return getVisitedGoodsWithSeller(keyword, lastIndex);
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
    const goodsArray: GoodsVO[] = new Array(10).fill(null)
      .map(() => MockGoodsApi.createMockGoods());
    return mockHttpRequest.success(goodsArray);
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
  purchase(goodsID: string): Promise<PurchaseResult> {
    console.log('purchase goodsID:', goodsID);
    return mockHttpRequest.success({
      nonceStr: "Eitm6bNcNBuiuF6E",
      package: "prepay_id=wx142304056617426311ec67b91052901600",
      paySign: "7304A5C335B29CA6B09A7FBA02309C8C",
      signType: "MD5",
      timeStamp: "1565795040",
      orderID: "orderID"
    } as PurchaseResult);
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
    return mockHttpRequest.success(goods);
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
      pictures: [
        'http://img1.imgtn.bdimg.com/it/u=2565994761,3746514896&fm=26&gp=0.jpg', 
        'http://img1.imgtn.bdimg.com/it/u=2565994761,3746514896&fm=26&gp=0.jpg'],
      price: createRandomNumberStr(),
      category: MockGoodsApi.createMockCateGory(),
      publishTime: Date.now(),
      state: GoodsState.InSale
    };
  }

  static createMockGoodsWithSeller(): GoodsWithSellerVO {
    return {
      goods: MockGoodsApi.createMockGoods(),
      seller: MockUserApi.createMockUser()
    };
  }

  getVisitedGoodsWithSeller(keyword: string, lastIndex: number): Promise<GoodsWithSellerVO[]> {
    return getVisitedGoodsWithSeller(keyword, lastIndex);
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
  InSale = 0,
  Deleted = 1, // 下架
  Paying = 2, // 支付中
  Frozen = 3, // 被冻结
}

export interface PurchaseResult {
  timeStamp: string,
  nonceStr: string,
  package: string,
  signType: string,
  paySign: string,
  orderID: string
}
