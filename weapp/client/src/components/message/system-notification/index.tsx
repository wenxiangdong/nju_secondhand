import "./index.scss";
import MessageRow from "../message-row";
import notice from "./notice.png";
import Taro from "@tarojs/taro";
import {View} from "@tarojs/components";
import urlList from "../../../utils/url-list";


export default function SystemNotification() {
  const handleClick = () => {
    Taro.navigateTo({
      url: urlList.MESSAGE_SYSTEM,
    })
  };
  return (
    <View className={"SN__container"} onClick={handleClick}>
      <View className={"SN__card"} hoverClass={"SN__card--hover"}>
        <MessageRow avatar={notice} name={"系统消息"}/>
      </View>
    </View>
  );
}
