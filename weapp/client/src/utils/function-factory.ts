import {relaunchTimeout} from "./date-util";

export const createSimpleErrorHandler = function (name: string, that?: any){
  return function (e: Error) {
    console.error(name, e);
    if (this) {
      const errMsg = e.message || '出错了，请稍后重试';
      this.setState({errMsg})
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
