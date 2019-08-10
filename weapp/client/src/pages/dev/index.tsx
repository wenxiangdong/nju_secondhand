import Taro from '@tarojs/taro';
import {View, Text} from "@tarojs/components";
import './index.scss'

function Dev() {

  return (
    <View>
      <Text>Dev works</Text>
    </View>
  )
}

Dev.config = {
  navigationBarTitleText: "试验"
};

export default Dev;
