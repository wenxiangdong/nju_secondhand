/**
 * 用户类型
 * @type {{FROZEN: string, NORMAL: string}}
 */
import {http, httpMock, USE_MOCK} from "./base";

export const USER_TYPES = {
    NORMAL: "normal",
    FROZEN: "frozen"
};

// models
export interface UserVO {
    _id: string;
    _openid: string;

    phone: string;
    nickname: string;
    address: Location;
    email: string;

    account: Account;

    signUpTime: number;
    state: number;
}

interface Location {
    name: string;
    address: string;
    latitude: string;
    longitude: string;
}

interface Account {
    balance: string;
}

// implements
interface IUserApi {
    // 用户管理
    getNormalUsers(keyword: string, lastIndex: number, size: number): Promise<UserVO[]>;

    freezeUser(userID: string): Promise; // 发通知

    getFrozenUsers(keyword: string, lastIndex: number, size: number): Promise<UserVO[]>;

    unfreezeUser(userID: string): Promise; // 发通知
}

class MockUserApi implements IUserApi {
    async getNormalUsers(keyword: string, lastIndex: number, size: number): Promise<UserVO[]> {
        const user: UserVO = {
            _id: "string",
            _openid: "openid" + keyword,
            phone: "111111111",
            nickname: "string",
            address: {
                name: "地址名称",
                address: "详细地址详细地址详细地址详细地址",
                latitude: "11.0",
                longitude: "11.0"
            },
            email: "string@sap.com",
            account: {
                balance: "200.0"
            },
            signUpTime: +new Date(),
            state: 0,
        };
        const users = Array(size)
            .fill(null)
            .map((_, index) => ({
                ...user,
                _id: Math.random(),
                nickname: USER_TYPES.NORMAL+ index
            }));
        const res = await httpMock(users);
        return res.data;
    }

    async freezeUser(userID: string): Promise {
        return httpMock("");
    }

    async getFrozenUsers(keyword: string, lastIndex: number, size: number): Promise<UserVO[]> {
        return (await this.getNormalUsers(keyword, lastIndex, size))
            .map((user, index) => ({
                ...user,
                nickname: USER_TYPES.FROZEN + index
            }));
    }

    unfreezeUser(userID: string): Promise {
        return this.freezeUser(userID);
    }// 发通知
}

class UserApi implements IUserApi {
    getFrozenUsers(keyword, lastIndex, size) {
        return http.get("/getFrozenUsers", {
            keyword,
            lastIndex,
            size
        });
    }

    getNormalUsers(keyword, lastIndex, size) {
        return http.get("/getNormalUsers", {
            keyword,
            lastIndex,
            size
        });
    }

    freezeUser(userID) {
        return http.post("/freezeUser", {userID});
    }

    unfreezeUser(userID) {
        return http.post("/unfreezeUser", {userID});
    }
}


let userApi: IUserApi = null;
if (USE_MOCK) {
    userApi = new MockUserApi();
} else {
    userApi = new UserApi();
}
export default userApi;
