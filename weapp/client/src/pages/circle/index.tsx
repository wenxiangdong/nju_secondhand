import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text, Button} from '@tarojs/components'
import MainTabBar from "../../components/common/main-tab-bar";
import {createSimpleErrorHandler} from "../../utils/function-factory";
import urlList from "../../utils/url-list";

/**
 * 圈子
 * @create 2019/7/25 11:49
 */
export class index extends Component {

  config: Config = {
    navigationBarTitleText: '圈子'
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

  private onError = createSimpleErrorHandler('circle', this);

  private onSendPostClick = () => {
    Taro.navigateTo({ url: urlList.CIRCLE_SEND_POST})
      .catch(this.onError);
  };

  render() {
    return (
      <View>
        <Text>圈子 works</Text>
        {/*TODO send post*/}
        <Button onClick={this.onSendPostClick}>send post</Button>
        <MainTabBar currentIndex={MainTabBar.CIRCLE_INDEX}/>
      </View>
    )
  }
}
