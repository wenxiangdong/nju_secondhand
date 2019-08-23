import {VO, httpRequest, mockHttpRequest} from "./HttpRequest";

export interface INotificationApi {
  // 取得通知消息
  getNotifications(lastIndex: number, size: number): Promise<NotificationVO[]>;

  // 发送通知消息（供其他接口调用）
  sendNotification(notification: NotificationDTO): Promise<void>;
}

const functionName = 'api'

class NotificationApi implements INotificationApi {
  async getNotifications(lastIndex: number, size: number): Promise<NotificationVO[]> {
    return await httpRequest.callFunction<NotificationVO[]>(functionName, { $url: "getNotifications", lastIndex, size });
  }

  async sendNotification(notification: NotificationDTO): Promise<void> {
    return await httpRequest.callFunction<void>(functionName, { $url: "sendNotification", notification });
  }
}

class MockNotificationApi implements INotificationApi {
  async getNotifications(lastIndex: number, size: number = 10): Promise<NotificationVO[]> {
    const noti: NotificationVO = {
      _id: "",
      userID: "userID",
      content: "这是一条系统通知这是一条系统通知这是一条系统通知这是一条系统通知",
      time: +new Date()
    };
    return mockHttpRequest.success(
      Array(size)
        .fill(undefined)
        .map((_, idx) => ({
          ...noti,
          _id: Math.random().toString(),
          time: noti.time - (lastIndex + idx) * 10000
        }))
    );
  }
  sendNotification(notification: NotificationDTO): Promise<void> {
    throw new Error("Method not implemented.");
  }

}

let notificationApi: INotificationApi = new NotificationApi();
let mockNotificationApi: INotificationApi = new MockNotificationApi();
export { notificationApi, mockNotificationApi }

export interface NotificationDTO {
  userID: string;
  content: string;
}

export interface NotificationVO extends VO {
  userID: string;
  content: string;
  time: number;
}
