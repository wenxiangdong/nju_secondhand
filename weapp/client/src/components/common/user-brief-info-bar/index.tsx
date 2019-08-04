import Taro from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import {MockUserApi, UserVO} from "../../../apis/UserApi";
import {AtAvatar} from "taro-ui";

import '../../../styles/common.scss'

interface IProp {
  user: UserVO
}

/**
 * UserBriefInfoBar
 * @author 张李承
 * @create 2019/8/4 10:43
 */
function UserBriefInfoBar(props: IProp) {
  const {user = MockUserApi.createMockUser()} = props;
  const {avatar, nickname} = user;
  return (
    <View className='flex-row-start-center'>
      <AtAvatar customStyle={{display: 'inline-block'}} circle size={'small'} image={avatar}/>
      <Text style={{marginLeft: '30px'}}>{nickname}</Text>
    </View>
  )
}

export default UserBriefInfoBar;
