import Taro from "@tarojs/taro";
import {View} from "@tarojs/components";

function WhiteSpace(props) {
  const {height = 50} = props;
  return (
    <View style={{
      height: `${height}px`,
      width: "100%"
    }}/>
  )
}

export default WhiteSpace;
