import Taro from "@tarojs/taro";
import {MessageVO} from "../../../apis/MessageApi";
import {Image, Text, View} from "@tarojs/components";
import dateFormat from "../../../utils/date-format";

export default function MessageContent(vo: MessageVO) {
  const IMAGE_PATTERN = /image:\/\/(.*)/;
  const TEXT_PATTERN = /text:\/\/(.*)/;
  const {content = "", time = 0} = vo;
  // 最终要返回的结点
  let node: any = null;

  if (IMAGE_PATTERN.test(content)) {
    const src = RegExp.$1;
    node = (
      <Image src={src} style={{
        maxWidth: "500rpx"
      }}/>
    );
  } else if (TEXT_PATTERN.test(content)) {
    const text = RegExp.$1;
    node = (<Text>{text}</Text>);
  } else {
    node = (<Text>{content}</Text>);
  }

  return (
    <View style={{padding: "10px", color: "white"}}>
      {node}
      <View style={{
        fontSize: "0.7em",
        textAlign: "right",
        width: "100%"
      }}>{dateFormat(time)}</View>
    </View>
  );
}
