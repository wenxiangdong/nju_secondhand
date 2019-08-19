import {http, httpMock, USE_MOCK} from "./base";

interface IAuthApi {
    login(username: string, password: string): Promise<void>;
}

class MockAuthApi implements IAuthApi {
    async login(username, password) {
        return httpMock();
    }
}

class AuthApi implements IAuthApi{
    async login(username, password) {
        return http.post(
            "/login",
            {
                username, password
            }
        );
    }
}

let authApi: IAuthApi;
if (USE_MOCK) {
    authApi = new MockAuthApi();
} else {
    authApi = new AuthApi();
}
export default authApi;