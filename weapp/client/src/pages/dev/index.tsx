import Taro from '@tarojs/taro';
import {View, Text, Button} from "@tarojs/components";
import './index.scss'
import "@tarojs/async-await";
import urlList, {complaintFormUrlConfig, resultUrlConfig, sendPostUrlConfig} from "../../utils/url-list";
import { apiHub } from '../../apis/ApiHub';
import DeveloperFooter from '../../components/common/developer-footer';


function Dev() {

  const handleClick = async () => {
    console.log(apiHub.configApi.getAllConfigs());
    Taro.reLaunch({
      url: urlList.MY
    })
  };

  return (
    <View>
      <Text>Dev works</Text>
      <Button onClick={handleClick}>go</Button>
      <DeveloperFooter />
    </View>
  )
}

Dev.config = {
  navigationBarTitleText: "试验"
};

export default Dev;
