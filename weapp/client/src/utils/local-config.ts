import * as Taro from "@tarojs/taro";

class LocalConfig {
  private KEY = 'nju.weapp.help_config';

  public isFirstUse(): boolean {
    return !Taro.getStorageSync(this.KEY);
  }

  public recordFinishHelp(): void {
    Taro.setStorageSync(this.KEY, true);
  }
}

const localConfig = new LocalConfig();
export default localConfig;
