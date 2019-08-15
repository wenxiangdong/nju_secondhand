import Taro from '@tarojs/taro';
import {View, Text, Button} from "@tarojs/components";
import './index.scss'
import MessageRight from '../../components/message/message-right';
import "@tarojs/async-await";
import urlList, {resultUrlConfig} from "../../utils/url-list";

function Dev() {

  const handleClick = async () => {
    // try {
    //   await Taro.requestPayment({
    //     nonceStr: "Eitm6bNcNBuiuF6E",
    //     package: "prepay_id=wx142304056617426311ec67b91052901600",
    //     paySign: "7304A5C335B29CA6B09A7FBA02309C8C",
    //     signType: "MD5",
    //     timeStamp: "1565795040"
    //   });
    //   Taro.showToast({
    //     title: "支付成功"
    //   });
    // } catch (error) {
    //   console.error(error);
    // }
    resultUrlConfig.go({
      title: "成功啦",
      status: "success",
      link: urlList.MY_PUBLISH,
      tip: "去我的发布"
    });
  };

  return (
    <View>
      <Text>Dev works</Text>
      <MessageRight content="text://hello world"/>
      <Button onClick={handleClick}>go</Button>
    </View>
  )
}

Dev.config = {
  navigationBarTitleText: "试验"
};

export default Dev;
