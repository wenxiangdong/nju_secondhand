import Taro, {Component} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'

interface IProp {

}

interface IState {

}

/**
 * SoldGoodsCard
 * @author 张李承
 * @create 2019/8/10 21:15
 */
export default class SoldGoodsCard extends Component<IProp, IState> {

  static defaultProps: IProp = {};

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
        <Text>SoldGoodsCard works</Text>
      </View>
    )
  }
}
