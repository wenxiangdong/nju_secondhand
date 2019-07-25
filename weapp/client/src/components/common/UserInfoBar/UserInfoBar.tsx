import Taro, {Component} from '@tarojs/taro'
import {View, OpenData} from '@tarojs/components'
import UserAvatar from '../UserAvator/UserAvatar'

import './UserInfoBar.scss'

/**
 * 用户信息条组件
 * @author 张李承
 * @create 2019/4/25 23:53
 */
export default class UserInfoBar extends Component {
  render() {
    return (
      <View className={'user-info-bar'}>
        <UserAvatar size={60} margin={20}/>
        <View className={'user-info-text'}>
          Hi,
          <OpenData className={'normal-text sm-margin user-date'} type={"userNickName"}/>
        </View>
      </View>
    )
  }
}
