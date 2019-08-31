import {VO, httpRequest, mockHttpRequest} from "./HttpRequest";
import Taro from "@tarojs/taro";
import localConfig from "../utils/local-config";
import MessageQueue from "../utils/message-queue";
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

  watchNotification() {
    const messageQueue = MessageQueue.getInstance();
    const watch = (userID) => {
      console.log("开始监听通知");
      Taro.cloud.database()
        .collection("notification")
        .where({
          userID,
          read: false
        })
        // @ts-ignore
        .watch({
          onChange: (res) => {
            console.log("系统消息监听", res);
            const {docChanges = []} = res;
            const notifications: NotificationVO[] = docChanges
              .filter((item) => ["init", 'add'].indexOf(item.dataType) >= 0)
              .map(item => item.doc);
            console.log(notifications);

            // 加入全局消息队列
            messageQueue.add(
              ...notifications.map(doc => `您有一条新的系统消息${
                doc.content 
                  ? "：" + doc.content
                  : ""
              }`)
            );

            // 告知已读
            this.readNotification(notifications.map(no => no._id));
          },
          onError: (e) => {
            console.error("监听通知出错" , e);
          }
        })
    };
    const userID = localConfig.getUserId();
    // 如果已经有userID了，那立马监听，否则等到useID有值了再监听
    if (userID) {
      watch(userID);
    } else {
      const ob = (key, value) => {
        if (key === localConfig.USER_ID && value) {
          watch(value);
          // 一旦有就解除监听
          localConfig.unsubscribe(ob);
        }
      };
      localConfig.subscribe(ob);
    }
  }
  async getNotifications(lastIndex: number, size: number = 10): Promise<NotificationVO[]> {
    return await httpRequest.callFunction<NotificationVO[]>(functionName, { $url: "getNotifications", lastIndex, size });
  }

  async sendNotification(notification: NotificationDTO): Promise<void> {
    return await httpRequest.callFunction<void>(functionName, { $url: "sendNotification", notification });
  }

  private readNotification(ids: string[]) {
    ids && ids.length && httpRequest.callFunction(functionName, {
      $url: "readNotifications",
      notificationIDs: [...ids]
    }).then(() => {
      console.log(ids, "系统消息已读");
    }).catch(console.error);
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
  read: boolean;
}
