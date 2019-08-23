import Taro from "@tarojs/taro";
import {View} from "@tarojs/components";
import MessageAvatar from "../message-avatar";
import MessageContent from "../message-content";
export default function MessageLeft({name, avatar = null, content, time}) {
  const avatarSection = (name || avatar)
    ? <MessageAvatar alt={name} backgroundColor={"#EE7785"} src={avatar}/>
    : <View style={{width: "1em"}}/>;
  const RADIUS = "10Px";

  return (
    <View style={{margin: "10Px auto", display: "flex", alignItems: "flex-end", paddingRight: "16px"}}>
      {avatarSection}
      <View style={{
        backgroundColor: "#EE7785",
        borderBottomRightRadius: RADIUS,
        borderTopLeftRadius: RADIUS,
        borderTopRightRadius: RADIUS
      }}>
        <MessageContent content={content} time={time} />
      </View>
    </View>
  );
}
