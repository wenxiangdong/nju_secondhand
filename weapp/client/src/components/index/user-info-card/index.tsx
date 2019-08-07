import Taro from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import {MockUserApi, UserVO} from "../../../apis/UserApi";
import {AtAvatar} from "taro-ui";

import "taro-ui/dist/style/components/flex.scss";

interface IProp {
  user: UserVO
}

/**
 * UserInfoCard
 * @author 张李承
 * @create 2019/8/4 9:20
 */
function UserInfoCard(props: IProp) {
  const {user = MockUserApi.createMockUser()} = props;
  const {nickname, avatar} = user;

  return (
    <View className='at-row at-row__align--center'>
      <View className='at-col at-col-1 at-col--auto'>
        <AtAvatar circle size={'small'} image={avatar}/>
      </View>
      <View className='at-col at-col-10 at-col__offset-1 at-col--wrap'>
        <Text>{nickname}</Text>
      </View>
    </View>
  )
}

export default UserInfoCard;
