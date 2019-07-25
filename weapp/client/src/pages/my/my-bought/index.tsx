import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'

/**
 * 我买到的
 * @create 2019/7/25 11:49
 */
export class index extends Component {

  config: Config = {
    navigationBarTitleText: '我买到的'
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
        <Text>我买到的 works</Text>
      </View>
    )
  }
}
