import Taro, { SocketTask } from "@tarojs/taro";

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
  private readonly messageHistory: Map<string, MessageVO[]>;
  private STORAGE_KEY: string = "messages";

  constructor(private websocket: SocketTask) {
    this.observers = [];
    this.messageHistory = new Map<string, MessageVO[]>();
    this.initWebsocket();
  }

  private initWebsocket() {
    this.websocket.onMessage((ev) => {
      console.log("onmessage", ev);
      const vo: MessageVO = JSON.parse(ev.data);
      // notify
      this.observers.forEach(ob => ob(vo));
      // store
      const senderID = vo.senderID;
      let messageList = this.messageHistory.get(senderID);
      if (!messageList) {
        messageList = [vo];
        this.messageHistory.set(senderID, messageList);
      } else {
        messageList.push(vo);
      }
      // 更新本地存储
      Taro.setStorage({
        key: this.STORAGE_KEY,
        data: this.messageHistory
      });
    });

    this.websocket.onOpen(() => {
      console.log("socket 成功连接");
    });

    this.websocket.onError((e) => {
      console.log(`socket连接出错，${e.errMsg}`);
    });
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
}

class MockSocket {
  public onmessage: (ev: MessageEvent) => void;
  constructor() {
  }

  onMessage(callback: Taro.SocketTask.onMessage.Param) {
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
    const senders = ["eric", "wang", "wen"];
    setInterval(() => {
      const sender = senders[Math.floor(Math.random() * senders.length)];
      callback && callback(
        // @ts-ignore
        {
          data: JSON.stringify({
            ...vo,
            _id: Math.random(),
            senderID: sender,
            senderName: sender,
          })
        }
      )
    }, 3000);
  }

  onOpen(){}

  onError(){}

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
