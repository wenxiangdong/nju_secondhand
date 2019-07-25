import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'

/**
 * 注册
 * @create 2019/7/25 11:49
 */
export class index extends Component {

  config: Config = {
    navigationBarTitleText: '注册'
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
        <Text>注册 works</Text>
      </View>
    )
  }
}
