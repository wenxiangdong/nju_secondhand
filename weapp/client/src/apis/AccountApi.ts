export interface IAccountApi {
    // 取款
    withdraw(amount: String): Promise<void>;
}

class AccountApi implements IAccountApi {
    withdraw(amount: String): Promise<void> {
        throw new Error("Method not implemented.");
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

export interface Account {
    balance: string;
}