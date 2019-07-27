import "@tarojs/async-await";
import { VO, httpRequest } from "./HttpRequest";

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

class UserApi implements IUserApi {
  async checkState(): Promise<UserState> {
    return await httpRequest.callFunction<UserState>("checkState");
  }
  async signUp(user: UserDTO): Promise<void> {
    return await httpRequest.callFunction<void>("signUp", { user });
  }
  async login(): Promise<UserVO> {
    return await httpRequest.callFunction<UserVO>("login");
  }
  async modifyInfo(user: UserDTO): Promise<void> {
    return await httpRequest.callFunction<void>("modifyInfo", { user });
  }
  async getUserInfo(userID: string): Promise<UserVO> {
    return await httpRequest.callFunction<UserVO>("getUserInfo", { userID });
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
    throw new Error("Method not implemented.");
  }
}

let userApi: IUserApi = new UserApi();
let mockUserApi: IUserApi = new MockUserApi();
export { userApi, mockUserApi }

export interface UserDTO {
  phone: string;
  nickname: string;
  address: Location;
  email: string;  // 检查唯一性
}

export interface UserVO extends VO {
  _openid: string;

  phone: string;
  nickname: string;
  address: Location;
  email: string;

  account: Account;

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
  Forzen, // 被管理员冻结
}
