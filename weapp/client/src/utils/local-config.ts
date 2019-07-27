import * as Taro from "@tarojs/taro";
import {CategoryVO} from "../apis/GoodsApi";

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
}

const localConfig = new LocalConfig();
export default localConfig;
