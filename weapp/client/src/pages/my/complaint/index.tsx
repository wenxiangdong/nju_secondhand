import Taro, {Component} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'

interface IState {

}

/**
 * index
 * @author 张李承
 * @create 2019/8/10 20:51
 */
export default class index extends Component<any, IState> {

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
