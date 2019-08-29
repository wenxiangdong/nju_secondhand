import Taro from '@tarojs/taro';
import {View, Text, Button} from "@tarojs/components";
import './index.scss'
import "@tarojs/async-await";
import urlList, {
  userInfoUrlConfig
} from "../../utils/url-list";


function Dev() {
  const handleClick = async () => {
    Taro.navigateTo({
      url: urlList.PUBLISH_GOODS
    })
    // userInfoUrlConfig.go("5d262bd45d5d6c6b05f9ecf551c28984");
  };

  return (
    <View>
      <Text>Dev works</Text>
      <Button onClick={handleClick}>go</Button>
    </View>
  )
}

Dev.config = {
  navigationBarTitleText: "试验"
};

export default Dev;
