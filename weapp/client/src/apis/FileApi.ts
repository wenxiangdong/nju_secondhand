import { mockHttpRequest } from "./HttpRequest";
import * as Taro from "@tarojs/taro";
import UploadFileResult = Taro.cloud.ICloud.UploadFileResult;
import DeleteFileResult = Taro.cloud.ICloud.DeleteFileResult;
import DeleteFileResultItem = Taro.cloud.ICloud.DeleteFileResultItem;
import DownloadFileResult = Taro.cloud.ICloud.DownloadFileResult;
import GetTempFileURLResult = Taro.cloud.ICloud.GetTempFileURLResult;
import GetTempFileURLResultItem = Taro.cloud.ICloud.GetTempFileURLResultItem;

export interface IFileApi {
    uploadFile(cloudPath: string, filePath: string): Promise<string>;

    downloadFile(fileID: string): Promise<string>;

    getTempFileURL(fileList: string[]): Promise<GetTempFileURLResultItem[]>;

    deleteFile(fileList: string[]): Promise<DeleteFileResultItem[]>;
}

class FileApi implements IFileApi {
    async uploadFile(cloudPath: string, filePath: string): Promise<string> {
        try {
            Taro.showLoading({ title: "上传文件中..." });
            let res = await Taro.cloud.uploadFile({
                cloudPath,
                filePath
            }) as UploadFileResult;
            return res.fileID;
        } catch (e) {
            throw e;
        } finally {
            Taro.hideLoading();
        }
    }

    async downloadFile(fileID: string): Promise<string> {
        try {
            Taro.showLoading({ title: "下载文件中..." });
            let res = await Taro.cloud.downloadFile({
                fileID
            }) as DownloadFileResult;
            return res.tempFilePath;
        } catch (e) {
            throw e;
        } finally {
            Taro.hideLoading();
        }
    }

    async getTempFileURL(fileList: string[]): Promise<GetTempFileURLResultItem[]> {
        try {
            Taro.showLoading({ title: "下载文件中..." });
            let res = await Taro.cloud.getTempFileURL({
                fileList
            }) as GetTempFileURLResult;
            return res.fileList;
        } catch (e) {
            throw e;
        } finally {
            Taro.hideLoading();
        }
    }

    async deleteFile(fileList: string[]): Promise<DeleteFileResultItem[]> {
        try {
            Taro.showLoading({ title: "删除文件中..." });
            let res = await Taro.cloud.deleteFile({
                fileList
            }) as DeleteFileResult;
            return res.fileList;
        } catch (e) {
            throw e;
        } finally {
            Taro.hideLoading();
        }
    }
}

class MockFileApi implements IFileApi {

    uploadFile(cloudPath: string, filePath: string): Promise<string> {
        return mockHttpRequest.success(cloudPath + filePath);
    }

    downloadFile(fileID: string): Promise<string> {
        return mockHttpRequest.success(fileID);
    }

    getTempFileURL(fileList: string[]): Promise<GetTempFileURLResultItem[]> {
        return mockHttpRequest.success([]);
    }

    deleteFile(fileList: string[]): Promise<DeleteFileResultItem[]> {
        return mockHttpRequest.success([]);
    }
}

let fileApi: IFileApi = new FileApi();
let mockFileApi: IFileApi = new MockFileApi();

export { fileApi, mockFileApi }