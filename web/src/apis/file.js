import {http, httpMock, USE_MOCK} from "./base";

export interface IFileApi {
    transferUrl(fileID: string): Promise<string>;
}

class MockFileApi implements IFileApi {
    async transferUrl(fileID) {
        const res =  await httpMock(fileID);
        return res.data;
    }
}

class FileApi implements IFileApi {
    transferUrl(fileID) {
        return http.get("/transferUrl", {fileID});
    }
}

let fileApi: IFileApi;
if (USE_MOCK) {
    fileApi = new MockFileApi();
} else {
    fileApi = new FileApi();
}
export default fileApi;