import Taro from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import {Location, MockUserApi} from "../../../apis/UserApi";
import {AtIcon} from "taro-ui";

import "taro-ui/dist/style/components/flex.scss";
import "./index.scss"

interface IProp {
  address: Location
}

/**
 * AddressShowBar
 * @author 张李承
 * @create 2019/8/4 9:12
 */
function AddressShowBar(props: IProp) {
  const {address = MockUserApi.createMockLocation()} = props;
  const {name} = address;

  const onClick = function () {
    // TODO 优先级 中
    // 跳转到地图
    console.log("查看位置 onclick TODO!");
  };

  return (
    <View className='at-row at-row__justify--between address-show-bar-view' onClick={onClick}>
      <View className='at-col at-col-7 at-col--wrap'>
        <AtIcon value={'map-pin'} size={30} />
        <Text>{name}</Text>
      </View>
      <View className='at-col at-col-4' style={{textAlign: 'right'}}>
        <Text>查看位置</Text>
        <AtIcon value={'chevron-right'} size={30} />
      </View>
    </View>
  )
}

export default AddressShowBar;
