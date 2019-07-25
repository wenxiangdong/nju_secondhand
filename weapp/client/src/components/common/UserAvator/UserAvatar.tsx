import Taro, {Component} from '@tarojs/taro'
import {View, OpenData} from '@tarojs/components'

import './UserAvatar.scss'

interface IProp {
  size: number,
  margin: number
}

/**
 * 用户头像组件
 * @author 张李承
 * @create 2019/4/26 9:07
 */
export default class UserAvatar extends Component<IProp, any> {
  render() {
    let {size, margin} = this.props;
    return (
      <View className={'user-avatar-wrapper'}
            style={{width: size + 'px', height: size + 'px', margin: margin + 'px'}}>
        <OpenData type={'userAvatarUrl'}/>
      </View>
    )
  }
}
