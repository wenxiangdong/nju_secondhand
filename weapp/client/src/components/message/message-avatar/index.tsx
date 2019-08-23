import Taro from "@tarojs/taro";
import {Image, View, OpenData} from "@tarojs/components";

export default function MessageAvatar({src = "", alt = "无", backgroundColor = "rgba(0,0,0,0.3)", self = false}) {
  const SIZE = "32Px";
  const FONT_SIZE = "16Px";
  const MARGIN = "5Px";
  const commonStyle = {height: SIZE, width: SIZE, overFlow: "hidden"};
  if (self) {
    return (
      <View style={{margin: MARGIN}}>
        <View style={{...commonStyle}} >
          <OpenData type="userAvatarUrl"/>
        </View>
      </View>
    );
  }
  return (
    <View style={{margin: MARGIN}}>
      {src
        ? (<Image
            src={src}
            style={{...commonStyle}}/>)
        : (<View
          style={{...commonStyle,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: backgroundColor,
            color: "white",
            fontSize: FONT_SIZE
          }}>{alt[0]}</View>)
      }
    </View>
  );
}

