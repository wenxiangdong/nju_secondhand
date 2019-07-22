// @ts-ignore
import {AtButton, AtMessage} from "taro-ui";
import Taro from '@tarojs/taro';
import {View} from "@tarojs/components";

function Dev() {
  const handleClick = () => {
    Taro.atMessage({
      message: "hello world",
      type: "success"
    })
  };
  return (
    <View>
      <AtMessage/>
      <AtButton onClick={handleClick}>hello</AtButton>
    </View>
  )
}

Dev.config = {
  navigationBarTitleText: "试验"
};

export default Dev;
