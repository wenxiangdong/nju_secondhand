import Taro from "@tarojs/taro";

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

declare type Observer = (msg: MessageVO) => void;

class MessageHub {
  private observers: Observer[];
  private messageHistory: Map<string, MessageVO[]>;
  private STORAGE_KEY: string = "messages";

  constructor(private websocket: Taro.SocketTask) {
    this.observers = [];
    this.initWebsocket();
    this.initMessageHistory();
  }

  private initWebsocket() {
    this.websocket.onMessage((ev: Taro.onSocketMessage.ParamParam) => {
      // console.log("onmessage", ev);
      const vo: MessageVO = JSON.parse(ev.data);
      // notify
      this.observers.forEach(ob => {
        try {
          ob(vo)
        } catch (e) {
          if (e.message && e.message.indexOf('.atMessage is not a function') < 0)
            console.error("监听消息出错", e, ob);
        }
      });
      // store
      this.addMessageToList(vo.senderID, vo);
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
    let messageList = this.messageHistory.get(key);
      if (!messageList) {
        messageList = [vo];
        this.messageHistory.set(key, messageList);
      } else {
        messageList.push(vo);
      }
      // 更新本地存储
      Taro.setStorage({
        key: this.STORAGE_KEY,
        data: this.messageHistory
      });
  }

  private initMessageHistory() {
    this.messageHistory = Taro.getStorageSync(this.STORAGE_KEY) || new Map<string, MessageVO[]>();;
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
    return this.messageHistory;
  }

  public getMessageListByKey(key: string): MessageVO[] {
    return this.messageHistory.get(key) || [];
  }

  public getLastMessageList(): MessageVO[] {
    const result = [] as MessageVO[];
    for (let list of this.messageHistory.values()) {
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
    const senders = ["eric", "wang", "wen", "he", "wo"];
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

let messageHub: MessageHub;
let websocket;
// 由于这个socket要在程序一开始就调用， 云环境未初始完成，所以不要引用 api hub中的mock，会引发其他云函数的调用
const mock = true;
if (mock) {
  websocket = new MockSocket();
}
messageHub = new MessageHub(websocket);

export default messageHub;
