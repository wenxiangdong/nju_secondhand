import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import MainTabBar from "../../components/common/main-tab-bar";

/**
 * 首页
 * @create 2019/7/25 11:49
 */
export default class index extends Component {

  config: Config = {
    navigationBarTitleText: '首页'
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
        <Text>首页 works</Text>
        <MainTabBar currentIndex={MainTabBar.HOME_INDEX}/>
      </View>
    )
  }
}
