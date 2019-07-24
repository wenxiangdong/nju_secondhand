import "@tarojs/async-await";
import * as Taro from "@tarojs/taro";

export interface IHttpRequest {
    // 云函数
    callFunction<T>(name: string, data?: object): Promise<T>;

    // 数据库
    database(): Taro.cloud.DB.Database;
}

class HttpRequest implements IHttpRequest {
    async callFunction<T>(name: string, data: object = {}): Promise<T> {
        try {
            const callResult = await Taro.cloud.callFunction({
                name,
                data
            });

            const response = callResult.result as HttpResponse<T>;

            if (response.code = HttpCode.Success) {
                return response.data;
            } else {
                throw response;
            }
        } catch (e) {
            throw e;
        }
    }

    database(): Taro.cloud.DB.Database {
        return Taro.cloud.database();
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
    Success,
    Conflict, // 409 冲突
    Not_Found, // 404
    Bad_Request, // 400 参数错误
    Fail
}

export interface HttpResponse<T> {
    code: HttpCode;
    data: T;
    message: string;
}

