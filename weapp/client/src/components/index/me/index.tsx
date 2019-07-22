import Taro from "@tarojs/taro";
import {View} from "@tarojs/components";

export default class Me extends Taro.Component {
  componentWillMount(): void {
    // noinspection JSIgnoredPromiseFromCall
    Taro.setNavigationBarTitle({
      title: "个人"
    })
  }

  render(): any {
    return (
      <View>
        me
      </View>
    );
  }
}
