import Taro from "@tarojs/taro";
import localConfig from "../utils/local-config";
import MessageQueue from "../utils/message-queue";
import {httpRequest} from "./HttpRequest";
// import "@tarojs/async-await";
const regeneratorRuntime = require("../lib/async");

export interface MessageVO {
  _id: string;
  senderID: string;
  senderName: string;

  receiverID: string;
  receiverName: string;

  content: string;

  time: number;
  read: boolean;
}

export interface MessageDTO {
  receiverID: string;
  content: string;
}

declare type Observer = (msg: MessageVO) => void;

class MessageHub {
  private observers: Set<Observer>;
  private messageHistory: object = {};
  private STORAGE_KEY: string = "messages";

  private messageIdReadQueue: string[] = [];

  constructor() {
    this.observers = new Set<Observer>();
    // this.initWebsocket();
    this.initMessageHistory();
    this.loopCheck();
  }

  public loopCheck = () => {
    console.log("循环检查已读消息队列", this.messageIdReadQueue);
    this.read([...this.messageIdReadQueue]);
    this.messageIdReadQueue = [];
    setTimeout(() => {
      this.loopCheck();
    }, 10 * 1000);
  };

  public startWatch() {
    const messageQueue = MessageQueue.getInstance();
    const ob = (key, value) => {
      if (key === localConfig.USER_ID) {
        watch(value);
        localConfig.unsubscribe(ob);
      }
    };
    const watch = (userID) => {
      console.log("开始监听消息");
      Taro.cloud.database()
        .collection("message")
        .where({
          receiverID: userID,
          read: false
        })
        // @ts-ignore
        .watch({
          onChange: (res) => {
            console.log("消息", res);
            const {docChanges = []} = res;
            const messageList: MessageVO[] = docChanges
              .filter(item => ["init", 'add'].indexOf(item.dataType) >= 0)
              .map(item => item.doc);

            // 加入本地和通知所有订阅者
            messageList.forEach(vo => {
              this.addMessageToLocalList(vo.senderID, vo);
              this.observers.forEach(item => {
                try {
                  item(vo);
                } catch (e) {}
              })
            });
            // 界面通知
            messageQueue.add(...messageList.map(vo => `【${vo.senderName}】发来一条消息`));
            // 已读队列
            this.addToQueue(...messageList.map(vo => vo._id));
          },
          onError: e => {
            console.log(e);
          }
        })
    };
    const userID = localConfig.getUserId();
    if (userID) {
      watch(userID);
    } else {
      localConfig.subscribe(ob);
    }
  }

  public async sendMessage(vo: MessageVO) {
    const {receiverID, content} = vo;
    console.log("发送", vo);
    await httpRequest.callFunction("api", {
      $url: "sendMessage",
      message: {
        receiverID: vo.receiverID,
        content: content
      } as MessageDTO
    });
    this.addMessageToLocalList(receiverID, vo);
  }

  /**
   *
   * @param key 往记录里加消息
   * @param vo
   */
  private addMessageToLocalList(key: string, vo: MessageVO) {
    console.log("add message to list", key, vo);
    let messageList = this.messageHistory[key];
      if (!messageList) {
        messageList = [vo];
        this.messageHistory[key] = messageList;
      } else {
        messageList.push(vo);
      }
      console.log(this.messageHistory);
      // 更新本地存储
      Taro.setStorageSync(this.STORAGE_KEY, this.messageHistory)
  }

  private initMessageHistory() {
    const data = Taro.getStorageSync(this.STORAGE_KEY);
    console.log("initMessageHistory", data);
    this.messageHistory = data ? data : {};
  }

  private addToQueue(...ids) {
    this.messageIdReadQueue.push(...ids);
    if (this.messageIdReadQueue.length > 10) {
      this.read([...this.messageIdReadQueue]);
      this.messageIdReadQueue = [];
    }
  }

  private read(ids: string[]) {
    ids && ids.length && httpRequest.callFunction("api", {
      $url: "readMessages",
      messageIDs: [...ids]
    }).then(() => {
      console.log("read", ids);
    }).catch(console.error);
  }

  public subscribe(observer: Observer) {
    this.observers.add(observer);
  }

  public unsubscribe(observer: Observer) {
    this.observers.delete(observer);
  }

  public getMessageHistory(): Map<string, MessageVO[]> {
    return new Map<string, MessageVO[]>(Object.entries(this.messageHistory));
  }

  public getMessageListByKey(key: string): MessageVO[] {
    return this.messageHistory[key] || [];
  }

  public getLastMessageList(): MessageVO[] {
    const result = [] as MessageVO[];
    for (let list of Object.values(this.messageHistory)) {
      result.push(list[list.length - 1]);
    }
    return result;
  }
}

let messageHub: MessageHub;
messageHub = new MessageHub();

export default messageHub;
