import {relaunchTimeout} from "./date-util";
import Taro from "@tarojs/taro";
import urlList from "./url-list";

export const createSimpleErrorHandler = function (name: string, that?: any){
  return function (e) {
    console.error(name, e);
    if (this) {
      const errMsg = e.message || '出错了，请稍后重试';
      this.setState({errMsg});
      if (e.code && e.code === 403) {
        setTimeout(() => {
          Taro.reLaunch({
            url: urlList.LOGIN
          })
            .catch(this.onError);
        }, relaunchTimeout);
      }
    }
  }.bind(that);
};

export const throttle = function (func:Function, that) {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      func.apply(that, arguments);
    }, relaunchTimeout);
  }
};
