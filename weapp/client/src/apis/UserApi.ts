import "@tarojs/async-await";
import {VO, httpRequest, db, Fail, HttpCode, mockHttpRequest} from "./HttpRequest";
import {AccountVO, MockAccountApi} from "./AccountApi";

export interface IUserApi {
  // 检查用户状态
  checkState(): Promise<UserState>;

  // 注册
  signUp(user: UserDTO): Promise<void>;

  // 登录
  login(): Promise<UserVO>;

  // 修改个人信息
  modifyInfo(user: UserDTO): Promise<void>;

  // 根据 ID 取得用户信息
  getUserInfo(userID: string): Promise<UserVO>;
}

const userCollection = db.collection('user');
const functionName = 'userApi'

class UserApi implements IUserApi {
  async checkState(): Promise<UserState> {
    return await httpRequest.callFunction<UserState>(functionName, { $url: 'checkState' });
  }
  async signUp(user: UserDTO): Promise<void> {
    if (await this.checkState() !== UserState.UnRegistered) {
      throw new Fail(HttpCode.Forbidden, "该用户已注册")
    }

    if ((await userCollection
      .where({
        email: user.email
      })
      .count()).total) {
      throw new Fail(HttpCode.Conflict, "该邮箱已被注册")
    }

    await userCollection
      .add({ data: user })
  }
  async login(): Promise<UserVO> {
    return await httpRequest.callFunction<UserVO>(functionName, { $url: 'login' });
  }
  async modifyInfo(user: UserDTO): Promise<void> {
    let userVO: UserVO = await this.login();

    if (userVO.state === UserState.Forzen) {
      throw new Fail(HttpCode.Forbidden, "你已被冻结，无法修改个人信息");
    }

    await userCollection
      .doc(userVO._id)
      .update({ data: user })
  }
  async getUserInfo(userID: string): Promise<UserVO> {
    return await httpRequest.callFunction<UserVO>(functionName, { $url: 'getUserInfo', userID });
  }
}

class MockUserApi implements IUserApi {
  checkState(): Promise<UserState> {
    throw new Error("Method not implemented.");
  }
  signUp(user: UserDTO): Promise<void> {
    throw new Error("Method not implemented.");
  }
  login(): Promise<UserVO> {
    throw new Error("Method not implemented.");
  }
  modifyInfo(user: UserDTO): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getUserInfo(userID: string): Promise<UserVO> {
    let userInfo = MockUserApi.createMockUser();
    userInfo._id = userID;
    return mockHttpRequest.success(userInfo);
  }

  static createMockLocation(): Location {
    return {
      longitude: '113.324520',
      latitude: '23.099994',
      name: 'testLocation',
      address: 'testAddress'
    };
  }

  static createMockUser(): UserVO {
    return {
      _id: '1',
      _openid: 'openid',
      phone: 'phone',
      nickname: 'nickname',
      avatar: 'https://static.segmentfault.com/sponsor/20190814.png',
      address: MockUserApi.createMockLocation(),
      email: 'email',
      account: MockAccountApi.createMockAccount(0.01),
      signUpTime: Date.now(),
      state: UserState.Normal
    };
  }
}

let userApi: IUserApi = new UserApi();
let mockUserApi: IUserApi = new MockUserApi();
export { userApi, mockUserApi, MockUserApi }

export interface UserDTO {
  phone: string;
  avatar: string;
  nickname: string;
  address: Location;
  email: string;  // 检查唯一性
}

export interface UserVO extends VO {
  _openid: string;

  phone: string;
  avatar: string;
  nickname: string;
  address: Location;
  email: string;

  account: AccountVO;

  signUpTime: number;
  state: UserState;
}

export interface Location {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
}

export enum UserState {
  UnRegistered, // 未注册
  Normal,
  Frozen, // 被管理员冻结
}
