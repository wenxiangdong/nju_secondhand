// @ts-ignore
import Taro from '@tarojs/taro';
import {View} from "@tarojs/components";
import './index.scss'
import MessageRow from "../../components/message/message-row";
import {SystemNotification} from "../../components/message/system-notification";
import MessageAvatar from "../../components/message/message-avatar";
import MessageContent from "../../components/message/message-content";
import MessageLeft from "../../components/message/message-left";
import MessageRight from "../../components/message/message-right";

function Dev() {
  // noinspection JSIgnoredPromiseFromCall
  Taro.setNavigationBarTitle({title: '测试'});
  const text = "text://dhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello worldhello world";


  return (
    <View>
      <SystemNotification/>
      <MessageRow name={"李培林"} extra={"hi"}/>
      <MessageAvatar/>
      <MessageLeft
        time={+new Date()}
        content={text} name={"李培林"}/>
        <MessageRight
          time={+new Date()}
          content={text}
          name={"文向东"}/>
    </View>
  )
}

Dev.config = {
  navigationBarTitleText: "试验"
};

// @ts-ignore
export default Dev;
