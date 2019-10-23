import "@tarojs/async-await";
const regeneratorRuntime = require("../lib/async");
import {httpRequest, mockHttpRequest} from "./HttpRequest";
import {createRandomNumberStr} from "./Util";

export interface IAccountApi {
  // 取款
  withdraw(amount: number): Promise<void>;
}

const functionName = 'api'

class AccountApi implements IAccountApi {
  async withdraw(amount: number): Promise<void> {
    return await httpRequest.callFunction<void>(functionName, { $url: "withdraw", amount });
  }
}

class MockAccountApi implements IAccountApi {
  withdraw(amount: number): Promise<void> {
    console.log(`withdraw success ${amount}`);
    return mockHttpRequest.success();
  }

  static createMockAccount(): AccountVO {
    return {
      balance: createRandomNumberStr()
    };
  }
}

let accountApi: IAccountApi = new AccountApi();
let mockAccountApi: IAccountApi = new MockAccountApi();

export { accountApi, mockAccountApi, MockAccountApi }

export interface AccountVO {
  balance: string;
}
