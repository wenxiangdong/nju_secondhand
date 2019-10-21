import localConfig from "./local-config";
import Taro from "@tarojs/taro";
import urlList from "./url-list";
import {relaunchTimeout} from "./date-util";
import {createSimpleErrorHandler} from "./function-factory";

export default function checkLogin(onError?, callback?) {
  const userID = localConfig.getUserId();
  const errorHandler = onError ? onError : createSimpleErrorHandler('check-login');
  if (!userID) {
    errorHandler(new Error("登录已失效"));
    setTimeout(() => {
      Taro.reLaunch({
        url: urlList.LOGIN
      }).catch(errorHandler);
    }, relaunchTimeout);
  } else {
    console.log("用户已登录");
    if (!localConfig.hasReadRules()) {
      localConfig.setReadRules(true);
      Taro.navigateTo({url: urlList.MY_PLATFORM_RULES}).catch(errorHandler);
    } else {
      callback && callback()
    }
  }
}
