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

  // read
  readNotification(id: string);

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
            console.log(res);
            const {docChanges = []} = res;
            const docs: NotificationVO[] = docChanges
              .filter((item) => ["init", 'add'].indexOf(item.dataType) >= 0)
              .map(item => item.doc);
            console.log(docs);
            // 加入全局消息队列
            messageQueue.add(
              ...docs.map(doc => `您有一条新的系统消息${
                doc.content 
                  ? "：" + doc.content.substring(0, 4) + "..."
                  : ""
              }`)
            );
            // 告知已读
            docs.forEach(doc => {
              this.readNotification(doc._id);
            })
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
      localConfig.subscribe((key, value) => {
        if (key === localConfig.USER_ID && value) {
          watch(value);
        }
      })
    }
  }
  async getNotifications(lastIndex: number, size: number = 10): Promise<NotificationVO[]> {
    return await httpRequest.callFunction<NotificationVO[]>(functionName, { $url: "getNotifications", lastIndex, size });
  }

  async sendNotification(notification: NotificationDTO): Promise<void> {
    return await httpRequest.callFunction<void>(functionName, { $url: "sendNotification", notification });
  }

  readNotification(id: string) {
    // TODO 调用云函数让通知已读
    console.log(id, "已读");
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

  readNotification(id: string) {
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
