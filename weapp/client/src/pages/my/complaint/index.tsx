import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'

interface IState {

}

/**
 * index
 * @author 张李承
 * @create 2019/8/10 20:51
 */
export default class index extends Component<any, IState> {

  config: Config = {
    navigationBarTitleText: '订单反馈'
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

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
        <Text>index works</Text>
      </View>
    )
  }
}
