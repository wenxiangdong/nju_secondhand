import {Location} from "../apis/UserApi";
import {MessageVO} from "../apis/MessageApi";
import {ResultProp} from "../pages/result";
import Taro from "@tarojs/taro";
import {ComplaintDTO} from "../apis/ComplaintApi";
import {PostDTO} from "../apis/CircleApi";

const urlList = {
  // DEV: "/pages/dev/index",
  INDEX:  '/pages/index/index',
  CIRCLE: '/pages/circle/index',
  CIRCLE_POST: '/pages/circle/post/index',
  CIRCLE_SEND_POST: '/pages/circle/send-post/index',
  INDEX_SEARCH_RESULT: '/pages/index/search-result/index',
  INDEX_CATEGORY_GOODS: '/pages/index/category-goods/index',
  INDEX_GOODS_INFO: '/pages/index/goods-info/index',
  INDEX_BUY: '/pages/index/buy/index',
  INDEX_LOCATION: '/pages/index/location/index',
  MESSAGE: '/pages/message/index',
  MESSAGE_SYSTEM: '/pages/message/system/index',
  MESSAGE_CHAT: '/pages/message/chat/index',
  MY: '/pages/my/index',
  MY_VISITED:'/pages/my/my-visited/index',
  MY_BOUGHT:'/pages/my/my-bought/index',
  MY_BOUGHT_SEND_COMPLAINT: '/pages/my/my-bought/send-complaint/index',
  MY_PUBLISH:'/pages/my/my-publish/index',
  MY_SOLD:'/pages/my/my-sold/index',
  MY_PLATFORM_ACCOUNT:'/pages/my/platform-account/index',
  MY_SOFTWARE_LICENSE_AGREEMENT:'/pages/my/software-license-agreement/index',
  MY_PRIVACY_POLICY:'/pages/my/privacy-policy/index',
  MY_PLATFORM_RULES:'/pages/my/platform-rules/index',
  MY_USER_INFO: '/pages/my/user-info/index',
  MY_COMPLAINT: '/pages/my/complaint/index',
  MY_COMPLAINT_NEW: '/pages/my/complaint/new-complaint/index',
  COMPLAINT_FORM: '/pages/my/complaint/complaint-form/index',
  LOGIN: '/pages/login/index',
  REGISTER: '/pages/register/index',
  PUBLISH_GOODS: '/pages/publish/index',
  RESULT: '/pages/result/index',
  ERROR: '',
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

  private preMessage: MessageVO | undefined;

  public createUrl(id): string {
    return encodeURI(`${urlList.MESSAGE_CHAT}?${this.USER_ID}=${id}`);
  }

  /**
   * 预设消息，作用是跳转到聊天页面时可以附带一条消息，马上发送，
   * 比如从商品那边过来的话，可以预设一条 商品信息 的消息
   * @param vo
   */
  public setPreMessage(vo: MessageVO) {
    this.preMessage = vo;
  }

  public getUserId(that): string|undefined {
    try {
      return that.$router.params[this.USER_ID];
    } catch (e) {
      console.error('ChatUrlConfig getUserId', e);
    }
  }

  /**
   * 获取传递过来的消息
   * 注意，只能拿一次，然后清空
   */
  public getPreMessage(): MessageVO | undefined {
    const vo = this.preMessage;
    this.preMessage = undefined;
    return vo;
  }
}

const chatUrlConfig = new ChatUrlConfig();

class SendComplaintUrlConfig {
  private readonly ORDER_ID = 'order_id';

  public createUrl(id): string {
    return encodeURI(`${urlList.MY_BOUGHT_SEND_COMPLAINT}?${this.ORDER_ID}=${id}`);
  }

  public getOrderId(that): string|undefined {
    try {
      return that.$router.params[this.ORDER_ID];
    } catch (e) {
      console.error('SendComplaintUrlConfig getOrderId', e);
    }
  }
}

const sendComplaintUrlConfig = new SendComplaintUrlConfig();

class ResultUrlConfig {
  public createUrl(params: ResultProp) {
    const paramString = Object
      .keys(params)
      .map(key => `${key}=${params[key]}`)
      .join("&");
    return `${urlList.RESULT}?${paramString}`;
  }

  public go(params: ResultProp) {
    Taro.redirectTo({
      url: this.createUrl(params)
    });
  }
}

const resultUrlConfig = new ResultUrlConfig();

class ComplaintFormUrlConfig {
  public go({desc = ""} = {}) {
    const url =`${urlList.COMPLAINT_FORM}?desc=${desc}`;
    return Taro.navigateTo({
      url
    });
  }
  public getConfig(context: Taro.Component): ComplaintDTO {
    // @ts-ignore
    return context.$router.params;
  }
}
const complaintFormUrlConfig = new ComplaintFormUrlConfig();

class SendPostUrlConfig {
  private prePost: PostDTO | undefined;
  public go(post: PostDTO | undefined = undefined) {
    this.prePost = post;
    return Taro.navigateTo({
      url: urlList.CIRCLE_SEND_POST
    });
  }

  public getPrePost() {
    let res = this.prePost;
    this.prePost = undefined;
    return res;
  }
}
const sendPostUrlConfig = new SendPostUrlConfig();

class CirclePostUrlConfig {
  private readonly CIRCLE_ID = 'circle_id';

  public createUrl(id): string {
    return encodeURI(`${urlList.CIRCLE_POST}?${this.CIRCLE_ID}=${id}`);
  }

  public getCircleId(that): string|undefined {
    try {
      return that.$router.params[this.CIRCLE_ID];
    } catch (e) {
      console.error('SendComplaintUrlConfig getOrderId', e);
    }
  }
}

const circlePostUrlConfig = new CirclePostUrlConfig();

export default urlList;
export {
  indexSearchUrlConfig,
  goodsInfoUrlConfig,
  chatUrlConfig,
  locationUrlConfig,
  sendComplaintUrlConfig,
  resultUrlConfig,
  complaintFormUrlConfig,
  sendPostUrlConfig,
  circlePostUrlConfig,
};
