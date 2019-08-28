import "@tarojs/async-await";
import { IGoodsApi, goodsApi, mockGoodsApi } from "./GoodsApi";
import { IFileApi, fileApi, mockFileApi } from "./FileApi";
import { IAccountApi, accountApi, mockAccountApi } from "./AccountApi";
import { ICircleApi, circleApi, mockCircleApi } from "./CircleApi";
import { IComplaintApi, complainApi, mockComplaintApi } from "./ComplaintApi";
import { INotificationApi, notificationApi, mockNotificationApi } from "./NotificationApi";
import { IOrderApi, orderApi, mockOrderApi } from "./OrderApi";
import { IUserApi, userApi, mockUserApi } from "./UserApi";
import configApi, { ConfigApi } from "./Config";
export interface IApiHub {
  accountApi: IAccountApi;
  circleApi: ICircleApi;
  complaintApi: IComplaintApi;
  fileApi: IFileApi;
  goodsApi: IGoodsApi;
  notificationApi: INotificationApi;
  orderApi: IOrderApi;
  userApi: IUserApi;
  configApi: ConfigApi
}

class ApiHub implements IApiHub {
  accountApi: IAccountApi = accountApi;
  circleApi: ICircleApi = circleApi;
  complaintApi: IComplaintApi = complainApi;
  fileApi: IFileApi = fileApi;
  goodsApi: IGoodsApi = goodsApi;
  notificationApi: INotificationApi = notificationApi;
  orderApi: IOrderApi = orderApi;
  userApi: IUserApi = userApi;
  configApi = configApi;
}

class MockApiHub implements IApiHub {
  accountApi: IAccountApi = mockAccountApi;
  circleApi: ICircleApi = mockCircleApi;
  complaintApi: IComplaintApi = mockComplaintApi;
  fileApi: IFileApi = mockFileApi;
  goodsApi: IGoodsApi = mockGoodsApi;
  notificationApi: INotificationApi = mockNotificationApi;
  orderApi: IOrderApi = mockOrderApi;
  userApi: IUserApi = mockUserApi;
  configApi = configApi;
}

export const mock = false;
notificationApi.watchNotification();

let apiHub: IApiHub = mock ? new MockApiHub() : new ApiHub();
export { apiHub };
