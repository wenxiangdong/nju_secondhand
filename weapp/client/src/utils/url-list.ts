import {Location} from "../apis/UserApi";

const urlList = {
  CIRCLE: '/pages/circle/index',
  CIRCLE_SEND_POST: '/pages/circle/send-post/index',
  INDEX:  '/pages/index/index',
  INDEX_SEARCH_RESULT: '/pages/index/search-result/index',
  INDEX_CATEGORY_GOODS: '/pages/index/category-goods/index',
  INDEX_GOODS_INFO: '/pages/index/goods-info/index',
  INDEX_BUY: '/pages/index/buy/index',
  INDEX_LOCATION: '/pages/index/location/index',
  MESSAGE: '/pages/message/index',
  MESSAGE_CHAT: '/pages/message/chat/index',
  MY: '/pages/my/index',
  MY_VISITED:'/pages/my/my-visited/index',
  MY_BOUGHT:'/pages/my/my-bought/index',
  MY_PUBLISH:'/pages/my/my-publish/index',
  MY_SOLD:'/pages/my/my-sold/index',
  MY_PLATFORM_ACCOUNT:'/pages/my/platform-account/index',
  MY_SOFTWARE_LICENSE_AGREEMENT:'/pages/my/software-license-agreement/index',
  MY_PRIVACY_POLICY:'/pages/my/privacy-policy/index',
  MY_PLATFORM_RULES:'/pages/my/platform-rules/index',
  MY_USER_INFO: '/pages/my/user-info/index',
  ERROR: ''
};

class IndexSearchUrlConfig {
  private readonly WORD = 'word';

  public createUrl(word): string {
    return encodeURI(`${urlList.INDEX_SEARCH_RESULT}?${this.WORD}=${word}`);
  }

  public getSearchWord(that): string|undefined {
    try {
      return that.$router.params[this.WORD];
    } catch (e) {
      console.error('IndexSearchUrlConfig getSearchWord', e);
    }
  }
}

const indexSearchUrlConfig = new IndexSearchUrlConfig();

class GoodsInfoUrlConfig {
  private readonly GOODS_ID = 'goods_id';

  public createUrl(id): string {
    return encodeURI(`${urlList.INDEX_GOODS_INFO}?${this.GOODS_ID}=${id}`);
  }

  public getGoodsId(that): string|undefined {
    try {
      return that.$router.params[this.GOODS_ID];
    } catch (e) {
      console.error('GoodsInfoUrlConfig getGoodsId', e);
    }
  }
}

const goodsInfoUrlConfig = new GoodsInfoUrlConfig();

class BuyUrlConfig {
  private readonly GOODS_ID = 'goods_id';

  public createUrl(id): string {
    return encodeURI(`${urlList.INDEX_BUY}?${this.GOODS_ID}=${id}`);
  }

  public getGoodsId(that): string|undefined {
    try {
      return that.$router.params[this.GOODS_ID];
    } catch (e) {
      console.error('BuyUrlConfig getGoodsId', e);
    }
  }
}

const buyUrlConfig = new BuyUrlConfig();

class LocationUrlConfig {
  private readonly LOCATION = 'location';

  public createUrl(location:Location): string {
    return encodeURI(`${urlList.INDEX_LOCATION}?${this.LOCATION}=${JSON.stringify(location)}`);
  }

  public getLocation(that): Location|undefined {
    try {
      return JSON.parse(that.$router.params[this.LOCATION]);
    } catch (e) {
      console.error('LocationUrlConfig getLocation', e);
    }
  }
}

const locationUrlConfig = new LocationUrlConfig();

class ChatUrlConfig {
  private readonly USER_ID = 'user_id';

  public createUrl(id): string {
    return encodeURI(`${urlList.MESSAGE_CHAT}?${this.USER_ID}=${id}`);
  }

  public getUserId(that): string|undefined {
    try {
      return that.$router.params[this.USER_ID];
    } catch (e) {
      console.error('ChatUrlConfig getUserId', e);
    }
  }
}

const chatUrlConfig = new ChatUrlConfig();

export default urlList;
export {
  indexSearchUrlConfig,
  goodsInfoUrlConfig,
  chatUrlConfig,
  buyUrlConfig,
  locationUrlConfig,
};
