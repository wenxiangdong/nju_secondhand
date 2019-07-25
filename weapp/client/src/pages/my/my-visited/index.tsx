import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'

/**
 * 我的足迹
 * @create 2019/7/25 11:49
 */
export class index extends Component {

  config: Config = {
    navigationBarTitleText: '我的足迹'
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
        <Text>我的足迹 works</Text>
      </View>
    )
  }
}
