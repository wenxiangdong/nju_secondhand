import Taro from "@tarojs/taro";
import configApi, {ConfigItem} from "./Config";

import localConfig from "../utils/local-config";
import urlList from "../utils/url-list";

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
  private observers: Observer[];
  private messageHistory: object = {};
  private STORAGE_KEY: string = "messages";
  private websocket: Taro.SocketTask;

  constructor() {
    this.observers = [];
    // this.initWebsocket();
    this.initMessageHistory();
  }

  public socketOpen(): boolean {
    return !!this.websocket;
  }

  public async initWebsocket(url) {
    console.log(url);
    try {
      this.websocket = await Taro.connectSocket({
        url
      });
      this.websocket.onMessage((ev: Taro.onSocketMessage.ParamParam) => {
        const vo: MessageVO = JSON.parse(ev.data);
        console.log("收到消息", vo);
        if (!vo || !vo.senderID) return;
        Taro.atMessage({
          message: `收到一条来自【${vo.senderName}】的消息`
        });
        // store
        this.addMessageToList(vo.senderID, vo);
        // notify
        this.observers.forEach(ob => {
          try {
            ob(vo)
          } catch (e) {
            if (e.message && e.message.indexOf('.atMessage is not a function') < 0)
              console.error("监听消息出错", e, ob);
          }
        });
      })
      this.websocket.onError((e) => {
        console.error(e);
      });
      this.websocket.onClose(() => {
        this.initWebsocket(url);
      });
      console.log("建立socket成功");
    } catch (e) {
      this.initWebsocket(url);
    }
  }

  public sendMessage(vo: MessageVO) {
    const {receiverID, content} = vo;
    this.websocket.send({
      data: JSON.stringify({receiverID, content})
    });
    this.addMessageToList(receiverID, vo);
  }

  /**
   *
   * @param key 往记录里加消息
   * @param vo
   */
  private addMessageToList(key: string, vo: MessageVO) {
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

  public subscribe(observer: Observer) {
    this.observers.push(observer);
  }

  public unsubscribe(observer: Observer) {
    this.observers.splice(
      this.observers.findIndex(ob => ob === observer),
      1
    );
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
