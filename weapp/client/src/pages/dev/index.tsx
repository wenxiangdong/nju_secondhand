import Taro, {useEffect} from '@tarojs/taro';
import {View, Text, Button} from "@tarojs/components";
import './index.scss'
import localConfig from "../../utils/local-config";


function Dev() {
  const handleClick = () => {
    // Taro.navigateTo({
    //   url: urlList.PUBLISH_GOODS
    // })
    // userInfoUrlConfig.go("5d262bd45d5d6c6b05f9ecf551c28984");
    // @ts-ignore
    // eslint-disable-next-line no-undef
    localConfig.setWithdrawTime(Date.now());
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
