import Taro from '@tarojs/taro'
import {View, Text} from '@tarojs/components'

import "./../wechat-user-info-bar/index.scss"
import {AtAvatar} from "taro-ui";

interface IProp {
  avatar: string,
  nickname: string
}

/**
 * DUserInfoBar
 * @author 张李承
 * @create 2019/8/13 0:02
 */
function DUserInfoBar(props: IProp) {
  const {avatar, nickname} = props;

  return (
    <View className={'user-info-bar'}>
      <AtAvatar customStyle={{display: 'inline-block', margin: '40rpx'}} circle size='large' image={avatar}/>
      <View className={'user-info-text'}>
        <Text className={'normal-text sm-margin user-date'}>
          Hi, {nickname}
        </Text>
      </View>
    </View>
  )
}

export default DUserInfoBar;
