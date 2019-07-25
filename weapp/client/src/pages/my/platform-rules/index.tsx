import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'

/**
 * 平台规则
 * @create 2019/7/25 11:49
 */
export class index extends Component {

  config: Config = {
    navigationBarTitleText: '平台规则'
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
        <Text>平台规则 works</Text>
      </View>
    )
  }
}
