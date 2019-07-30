import Taro from "@tarojs/taro";
import {View} from "@tarojs/components";
import MessageAvatar from "../message-avatar";
import MessageContent from "../message-content";
export default function MessageRight({name, avatar = null, content, time}) {
  const avatarSection = <MessageAvatar alt={name} backgroundColor={"#84B1ED"} src={avatar}/>;
  const RADIUS = "10Px";


  return (
    <View style={{
      margin: "10Px auto",
      display: "flex",
      flexDirection: "row-reverse",
      alignItems: "flex-end",
      paddingLeft: "16px"}}>
      {avatarSection}
      <View style={{
        backgroundColor: "#84B1ED",
        borderBottomLeftRadius: RADIUS,
        borderTopLeftRadius: RADIUS,
        borderTopRightRadius: RADIUS
      }}>
        <MessageContent content={content} time={time} />
      </View>
    </View>
  );
}
