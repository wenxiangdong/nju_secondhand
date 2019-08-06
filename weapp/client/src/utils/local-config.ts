import * as Taro from "@tarojs/taro";
import {CategoryVO, GoodsWithSellerVO} from "../apis/GoodsApi";

interface WindowSize {
  /**
   * 可使用窗口宽度
   */
  windowWidth: number
  /**
   * 可使用窗口高度
   */
  windowHeight: number
}

class LocalConfig {
  private readonly KEY = 'nju.weapp.help_config';
  private readonly SYS_INFO = 'nju.weapp.sys_info';
  private readonly CATEGORY = 'nju.weapp.category';
  private readonly USER_ID = 'nju.weapp.user_id';
  private readonly WITHDRAW_TIME = 'nju.weapp.withdraw_time';

  private readonly VISITED_GOODS_WITH_SELLER = 'nju.weapp.visited_goods_with_seller';
  private readonly VISITED_SIZE = 100;

  public isFirstUse(): boolean {
    return !Taro.getStorageSync(this.KEY);
  }

  public recordFinishHelp(): void {
    Taro.setStorageSync(this.KEY, true);
  }

  public getSystemSysInfo(): WindowSize {
    let result:WindowSize = Taro.getStorageSync(this.SYS_INFO);
    if (!result) {
      const info = Taro.getSystemInfoSync();
      result = {windowHeight: info.windowHeight, windowWidth: info.windowWidth};
      Taro.setStorageSync(this.SYS_INFO, result);
    }
    return result;
  }

  public setGoodsCategory(category): void {
    Taro.setStorageSync(this.CATEGORY, category);
  }

  public getGoodsCategory(): CategoryVO {
    return Taro.getStorageSync(this.CATEGORY);
  }

  public setUserId(userId: string): void {
    Taro.setStorageSync(this.USER_ID, userId);
  }

  public getUserId(): string {
    return Taro.getStorageSync(this.USER_ID);
  }

  public setWithdrawTime(time: number): void {
    Taro.setStorageSync(this.WITHDRAW_TIME, time);
  }

  public getWithdrawTime(): number {
    return Taro.getStorageSync(this.WITHDRAW_TIME);
  }

  public addVisitedGoodsWithSeller(goodsWithSeller: GoodsWithSellerVO): void {
    let goodsWithSellerArray = this.getVisitedGoodsWithSeller();
    goodsWithSellerArray = this.removeGoodsWithSellerFronVisited(goodsWithSeller, goodsWithSellerArray);

    goodsWithSellerArray.unshift(goodsWithSeller);
    if (goodsWithSellerArray.length > this.VISITED_SIZE) {
      goodsWithSellerArray.pop();
    }

    this.setVisitedGoodsWithSeller(goodsWithSellerArray);
  }

  public removeVisitedGoodsWithSeller(goodsWithSeller: GoodsWithSellerVO): void {
    let goodsWithSellerArray = this.getVisitedGoodsWithSeller();
    goodsWithSellerArray = this.removeGoodsWithSellerFronVisited(goodsWithSeller, goodsWithSellerArray);
    this.setVisitedGoodsWithSeller(goodsWithSellerArray);
  }

  public getVisitedGoodsWithSeller(): GoodsWithSellerVO[] {
    return Taro.getStorageSync(this.VISITED_GOODS_WITH_SELLER) || [];
  }

  private removeGoodsWithSellerFronVisited(obj: GoodsWithSellerVO, arr: GoodsWithSellerVO[]): GoodsWithSellerVO[] {
    arr.some((arrObj, idx) => {
      if (arrObj.goods._id === obj.goods._id) {
        arr.splice(idx, 1);
        return true;
      }
    });
    return arr;
  }

  private setVisitedGoodsWithSeller(goodsWithSellerArray: GoodsWithSellerVO[]): void {
    Taro.setStorageSync(this.VISITED_GOODS_WITH_SELLER, goodsWithSellerArray);
  }
}

const localConfig = new LocalConfig();
export default localConfig;
