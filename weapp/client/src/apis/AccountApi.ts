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
    throw new Error("Method not implemented.");
  }
}

let accountApi: IAccountApi = new AccountApi();
let mockAccountApi: IAccountApi = new MockAccountApi();

export { accountApi, mockAccountApi }

export interface AccountVO {
  balance: string;
}
