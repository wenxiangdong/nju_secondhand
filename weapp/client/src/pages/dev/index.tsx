import Taro from '@tarojs/taro';
import {View, Text, Button} from "@tarojs/components";
import './index.scss'
import "@tarojs/async-await";
import urlList, {complaintFormUrlConfig, resultUrlConfig, sendPostUrlConfig} from "../../utils/url-list";

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
    sendPostUrlConfig.go({
      desc: "买东西啦"
    });
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
