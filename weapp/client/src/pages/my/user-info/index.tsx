import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'

interface IState {

}

/**
 * index
 * @author 张李承
 * @create 2019/8/11 23:18
 */
export default class index extends Component<any, IState> {

  private readonly NOT_FIND_USER_ID_ERROR:Error = new Error('登录已失效');

  config: Config = {
    navigationBarTitleText: '用户信息'
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
