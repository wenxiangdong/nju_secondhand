import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import MainTabBar from "../../components/common/main-tab-bar";

/**
 * 消息
 * @create 2019/7/25 11:49
 */
export class index extends Component {

  config: Config = {
    navigationBarTitleText: '消息'
  };

  componentWillMount() {
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
  }

  render() {
    return (
      <View>
        <Text>消息 works</Text>
        <MainTabBar currentIndex={MainTabBar.MESSAGE_INDEX}/>
      </View>
    )
  }
}
