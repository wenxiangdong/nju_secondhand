import Taro from '@tarojs/taro';
import {View, Text, Button} from "@tarojs/components";
import './index.scss'


function Dev() {
  const handleClick = () => {
    // Taro.navigateTo({
    //   url: urlList.PUBLISH_GOODS
    // })
    // userInfoUrlConfig.go("5d262bd45d5d6c6b05f9ecf551c28984");
    // @ts-ignore
    // eslint-disable-next-line no-undef
    wx.cloud.database()
      .collection("notification")
      .where({})
      // @ts-ignore
      .watch({
        onChange: (res) => {
          console.log(res);
        },
        onError: (e) => {
          console.log(e)
        }
      })
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
