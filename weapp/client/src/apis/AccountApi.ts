import "@tarojs/async-await";
import { httpRequest } from "./HttpRequest";

export interface IAccountApi {
  // 取款
  withdraw(amount: String): Promise<void>;
}

const functionName = 'accountApi'

class AccountApi implements IAccountApi {
  async withdraw(amount: String): Promise<void> {
    return await httpRequest.callFunction<void>(functionName, { $url: "withdraw", amount });
  }
}

class MockAccountApi implements IAccountApi {
  withdraw(amount: String): Promise<void> {
    console.log(`withdraw success ${amount}`);
    return Promise.resolve();
  }

  static createMockAccount(account?:number|string): AccountVO {
    account = account || '1.01';
    return {
      balance: Number(account).toFixed(2)
    };
  }
}

let accountApi: IAccountApi = new AccountApi();
let mockAccountApi: IAccountApi = new MockAccountApi();

export { accountApi, mockAccountApi, MockAccountApi }

export interface AccountVO {
  balance: string;
}
