import {VO, httpRequest, mockHttpRequest} from "./HttpRequest";
import Taro from "@tarojs/taro";
const regeneratorRuntime = require("../lib/async");

interface Snapshot {
  docChanges: object[];
  docs: object[];
  type: string;
  id: string;
}

export interface INotificationApi {
  // 取得通知消息
  getNotifications(lastIndex: number, size?: number): Promise<NotificationVO[]>;

  // 发送通知消息（供其他接口调用）
  sendNotification(notification: NotificationDTO): Promise<void>;

  watchNotification();
}

const functionName = 'api'

class NotificationApi implements INotificationApi {
  private timeout = 5 * 1000;
  watchNotification() {
    Taro.cloud.database()
      .collection("notification")
      .where({read: false})
      // @ts-ignore
      .watch({
        onChange: (res) => {
          console.log(res);
        },
        onError: console.log
      })
    // setTimeout(async () => {
    //   console.log(this.timeout);
    //   try {
    //     const list = await httpRequest.callFunction<NotificationVO[]>("notification");
    //     if (list.length) {
    //       Taro.atMessage({
    //         message: "你有新的系统消息，请尽快查看"
    //       });
    //       this.timeout = this.timeout <= 5000 ? 5000 : this.timeout - 1000;
    //     } else {
    //       this.timeout = this.timeout > 15 * 1000 ? 15000 : this.timeout + 1000;
    //     }
    //   } catch (error) {
    //     console.log(error);
    //   }
    //   setTimeout(() => {
    //     this.watchNotification();
    //   }, this.timeout);
    // }, this.timeout);
  }
  async getNotifications(lastIndex: number, size: number = 10): Promise<NotificationVO[]> {
    return await httpRequest.callFunction<NotificationVO[]>(functionName, { $url: "getNotifications", lastIndex, size });
  }

  async sendNotification(notification: NotificationDTO): Promise<void> {
    return await httpRequest.callFunction<void>(functionName, { $url: "sendNotification", notification });
  }
}

class MockNotificationApi implements INotificationApi {
  watchNotification() {
    throw new Error("Method not implemented.");
  }
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
