import Taro from '@tarojs/taro';
import {View, Text} from "@tarojs/components";
import './index.scss'
import MessageRight from '../../components/message/message-right';

function Dev() {

  return (
    <View>
      <Text>Dev works</Text>
      <MessageRight content="text://hello world"/>
    </View>
  )
}

Dev.config = {
  navigationBarTitleText: "试验"
};

export default Dev;
