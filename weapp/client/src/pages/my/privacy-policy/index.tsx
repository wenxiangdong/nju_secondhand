import Taro, { useState, useEffect } from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components'
import WhiteSpace from "../../../components/common/white-space";
import {apiHub} from "../../../apis/ApiHub";
import { ConfigItem } from '../../../apis/Config';

function PrivacyPolicy() {
  const [info, setInfo] = useState({});
  useEffect(() => {
    const config = {};
    config.author = apiHub.configApi.getConfig(ConfigItem.COMPANY_NAME);
    config.rules = apiHub.configApi.getConfig(ConfigItem.PRIVATE_POLICY);
    config.logo = apiHub.configApi.getConfig(ConfigItem.LOGO);
    setInfo({
      ...config
    });
  }, []);
  return (
    <View className='at-article'>
      <View className='at-article__h1'>
        <Text>隐私权条款</Text>
      </View>
      <View className='at-article__info'>
        <Text decode space="nbsp">{info.author}</Text>
      </View>
      <View className='at-article__content'>
        <View className='at-article__section'>
          {
            info.rules.map((rule) => (
              <View className='at-article__p'>
                <Text>{rule}</Text>
              </View>
            ))
          }
        </View>
      </View>
      <WhiteSpace/>
    </View>
  )
}

PrivacyPolicy.config = {
  navigationBarTitleText: "隐私权条款"
};

