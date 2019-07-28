// @ts-ignore
import Taro from '@tarojs/taro';
import {View, Text} from "@tarojs/components";
import './index.scss'
import {AtButton, AtDivider} from "taro-ui";

function Dev() {
  // noinspection JSIgnoredPromiseFromCall
  Taro.setNavigationBarTitle({title: '测试'});

  return (
    <View>
      <View>
        <Text>TODO 商品简介卡片</Text>
      </View>
      <AtDivider content='商品详情'/>
      <Text>TODO 商品详情</Text>
      <AtDivider content='关于卖家'/>
      <Text>TODO 关于卖家</Text>

      <AtDivider content='问题互动'/>
      <Text>TODO 搁置</Text>
      <AtDivider content='相似商品'/>
      <Text>TODO 搁置</Text>

      <View className='at-row'>
        {/*TODO 底部固定*/}
        <View className='at-col at-col__offset-1 at-col-4'>
          <AtButton circle type='secondary' customStyle={{height: '30px', lineHeight: '30px'}}>马上买</AtButton>
        </View>
        <View className='at-col at-col__offset-2 at-col-4'>
          <AtButton circle type='primary' customStyle={{height: '30px', lineHeight: '30px'}}>聊一聊</AtButton>
        </View>
      </View>
    </View>
  )
}

Dev.config = {
  navigationBarTitleText: "试验"
};

// @ts-ignore
export default Dev;
