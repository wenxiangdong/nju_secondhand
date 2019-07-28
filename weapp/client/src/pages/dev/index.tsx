// @ts-ignore
import Taro from '@tarojs/taro';
import {View} from "@tarojs/components";
import './index.scss'

function Dev() {
  // noinspection JSIgnoredPromiseFromCall
  Taro.setNavigationBarTitle({title: '测试'});

  return (
    <View>
    </View>
  )
}

Dev.config = {
  navigationBarTitleText: "试验"
};

// @ts-ignore
export default Dev;
