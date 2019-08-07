import "@tarojs/async-await";
import * as Taro from "@tarojs/taro";
import { copy } from "./Util";

export interface IHttpRequest {
  // 云函数
  callFunction<T>(name: string, data?: object): Promise<T>;
}

let db: Taro.cloud.DB.Database = Taro.cloud.database();
let command: Taro.cloud.DB.DatabaseCommand = db.command;
export { db, command };

class HttpRequest implements IHttpRequest {
  async callFunction<T>(name: string, data: object = {}): Promise<T> {
    try {
      const callResult = await Taro.cloud.callFunction({
        name,
        data
      });

      // const response = callResult.result as HttpResponse<T>;
      return copy<T>(callResult.result);
      // if (response.code = HttpCode.Success) {
      //     return response.data;
      // } else {
      //     throw new Fail(response.code, response.message);
      // }
    } catch (e) {
      if (e.hasOwnProperty('code'))
        throw new Fail(e.code, e.message);
      else
        throw new Fail(HttpCode.Fail, e.errMsg);
    }
  }
}

class MockHttpRequest {
  async success<T>(data: T = {} as T): Promise<T> {
    await new Promise(resolve => {
      setTimeout(resolve, 1000);
    })
    return data;
  }
}

let httpRequest: IHttpRequest = new HttpRequest();
let mockHttpRequest = new MockHttpRequest();
export { httpRequest, mockHttpRequest };

export interface VO {
  _id: string;
}

export enum HttpCode {
  // Success,
  Forbidden = 403, // 403
  Not_Found = 404, // 404
  Conflict = 409, // 409 冲突
  // Bad_Request, // 400 参数错误
  Fail = 500 // 500
}

// export interface HttpResponse<T> {
//     code: HttpCode;
//     data: T;
//     message: string;
// }

export class Fail {
  code: HttpCode;
  message: string;

  constructor(code: HttpCode, message: string) {
    this.code = code;
    this.message = message;
  }
}