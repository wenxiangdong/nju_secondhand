import Taro from "@tarojs/taro";
import configApi, {ConfigItem} from "./Config";

import localConfig from "../utils/local-config";

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

  constructor(private websocket: Taro.SocketTask) {
    this.observers = [];
    this.initWebsocket();
    this.initMessageHistory();
  }

  private initWebsocket() {
    this.websocket.onMessage((ev: Taro.onSocketMessage.ParamParam) => {
      const vo: MessageVO = JSON.parse(ev.data);
      console.log("收到消息", vo);
      if (!vo.senderID) return;
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
    this.messageHistory = data;
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

class MockSocket {
  public send(){}
  public onMessage (onParam) {
    const vo: MessageVO = {
      _id: "string",
      senderID: "sender",
      senderName: "name",
      receiverID: "string",
      receiverName: "string",
      content: "text://内容内容内容内容",
      time: +new Date(),
      read: false
    };
    setInterval(() => {
      onParam(
        // @ts-ignore
        {
          data: JSON.stringify({
            ...vo,
            _id: Math.random(),
          })
        }
      )
    }, 5000);
  }

}

class Socket {
  private wechatSocket: Taro.SocketTask;
  private timerId;
  private onParam;
  constructor() {
    this.init();
  }
  async init() {
    const url = configApi.getConfig(ConfigItem.SOCKET_ADDRESS);
    const userID = localConfig.getUserId();
    if (!url || !userID) {
      console.log("未登陆，不能连接");
      this.timerId = setTimeout(() => {
        this.init();
      }, 10 * 1000);
      throw new Error("socket连接出错");
    }
    try {
      this.wechatSocket = await Taro.connectSocket({url: `${url}/${userID}`});
      if (this.onParam) {
        this.onMessage(this.onParam);
      }
      this.wechatSocket.onError((e) => {
        Taro.atMessage({
          message: `通信出错：${e.errMsg}`,
          type: "error"
        });
      });
      this.wechatSocket.onClose(() => {
        console.log("socket 断开, 10秒后重连");
        setTimeout(() => {
          this.init();
        }, 10 * 1000);
      });
      console.log("socket 连接成功");
    } catch (e) {
      console.error(e);
      this.timerId = setTimeout(() => {
        this.init();
      }, 30 * 1000);
    }

  }
  onMessage(onParam) {
    if (!this.wechatSocket) {
      clearTimeout(this.timerId);
      this.onParam = onParam;
      this.init();
    } else {
      this.wechatSocket.onMessage(onParam);
    }
  }
  send(msg) {
    if (!this.wechatSocket) {
      clearTimeout(this.timerId);
      this.init().then(() => this.wechatSocket.send(msg)).catch(console.error);
    } else {
      this.wechatSocket.send(msg);
    }
  }
}

let messageHub: MessageHub;
let websocket;
// 由于这个socket要在程序一开始就调用， 云环境未初始完成，所以不要引用 api hub中的mock，会引发其他云函数的调用
const mock = false;
if (mock) {
  websocket = new MockSocket();
} else {
  websocket = new Socket();
}
messageHub = new MessageHub(websocket);

export default messageHub;
