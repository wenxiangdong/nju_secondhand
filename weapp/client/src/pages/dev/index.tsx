// @ts-ignore
import Taro, {useEffect, useState} from '@tarojs/taro';
import {View} from "@tarojs/components";
import './index.scss'
import MessageRow from "../../components/message/message-row";
import SystemNotification from "../../components/message/system-notification";
import MessageAvatar from "../../components/message/message-avatar";
import MessageLeft from "../../components/message/message-left";
import MessageRight from "../../components/message/message-right";
import messageHub, {MessageVO} from "../../apis/MessageApi";
import {AtMessage} from "taro-ui";

class Dev extends Taro.Component<any, {messageList: MessageVO[]}> {
  // noinspection JSIgnoredPromiseFromCall
  state = {
    messageList: []
  };

  componentDidMount(): void {
    const ob = (vo) => {
      console.log(vo);
      this.setState(pre => ({
        messageList: [...pre.messageList, vo]
      }))
    };
    messageHub.subscribe(ob);
  }

  render(): any {
    const {messageList} = this.state;
    return (
      <View>
        <AtMessage />
        <SystemNotification />
        <MessageRow name='李培林' extra='hi' />
        {
          messageList.map((msg: MessageVO) => (
            <MessageLeft key={msg._id} name={msg.senderName} content={msg.content} time={msg.time} />
          ))
        }
      </View>
    )
  }
}

Dev.config = {
  navigationBarTitleText: "试验"
};

// @ts-ignore
export default Dev;
