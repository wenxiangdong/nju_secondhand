import "@tarojs/async-await";
import * as Taro from "@tarojs/taro";

export interface IHttpRequest {
  // 云函数
  callFunction<T>(name: string, data?: object): Promise<T>;
}

let db: Taro.cloud.DB.Database = Taro.cloud.database();
let command: Taro.cloud.DB.DatabaseCommand = db.command;
export { db, command };

class HttpRequest implements IHttpRequest {
  async callFunction<T>(name: string, data: object = {}): Promise<T> {
    console.log("request", name, data);
    try {
      const callResult = await Taro.cloud.callFunction({
        name,
        data
      });

      const response = callResult.result as HttpResponse<T>;
      console.log(response)
      if (response.code === HttpCode.Success) {
        return response.data;
      } else {
        throw new Fail(response.code, response.message);
      }
    } catch (e) {
        throw e
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
  Success = 200,
  Forbidden = 403, // 403
  Not_Found = 404, // 404
  Conflict = 409, // 409 冲突
  // Bad_Request, // 400 参数错误
  Fail = 500 // 500
}

export interface HttpResponse<T> {
  code: HttpCode;
  data: T;
  message: string;
}

export class Fail {
  code: HttpCode;
  message: string;

  constructor(code: HttpCode, message: string) {
    this.code = code;
    this.message = message;
  }
}
