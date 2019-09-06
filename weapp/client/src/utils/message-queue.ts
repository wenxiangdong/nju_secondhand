import Taro from "@tarojs/taro";
/**
 * 集中式 消息显示 队列
 */
class MessageQueue {
  private readonly queue: string[] = [];
  private readonly DURATION = 3000;
  private busy = false;  // 当前队列是否忙，也就是是否有消息

  private static instance: MessageQueue;
  public static getInstance() {
    if (!this.instance) {
      this.instance = new MessageQueue();
    }
    return this.instance;
  }

  public add(...messages) {
    this.queue.push(...messages);
    if (!this.busy) {
      this.loop();
    }
  }

  private loop() {
    const message = this.queue.shift();
    console.log("拿到要显示的消息", message);
    if (message) {
      this.busy = true;
      Taro.showToast({
        title: message,
        icon: "none",
        duration: this.DURATION
      });
      // try {
      //   Taro.atMessage({
      //     message,
      //     duration: this.DURATION
      //   });
      // } catch (e) {
      //   Taro.showToast({
      //     title: message,
      //     icon: "none",
      //     duration: this.DURATION
      //   });
      // }
      // 开启下次循环
      setTimeout(() => {
        this.loop();
      }, this.DURATION + 500);
    }
    else {
      this.busy = false;
    }
  }
}

export default MessageQueue;
