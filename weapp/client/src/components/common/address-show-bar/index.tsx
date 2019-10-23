import Taro from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import {Location, MockUserApi} from "../../../apis/UserApi";
import {AtIcon} from "taro-ui";

import "./index.scss"
import {locationUrlConfig} from "../../../utils/url-list";
import {createSimpleErrorHandler} from "../../../utils/function-factory";

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

  const onError = createSimpleErrorHandler('AddressShowBar', undefined);

  const onClick = function () {
    Taro.navigateTo({
      url: locationUrlConfig.createUrl(address)
    }).catch(onError);
  };

  const {name} = address;

  return (
    <View className='address-show-bar-view' onClick={onClick}>
      <View className='left-view'>
        <AtIcon value='map-pin' size={30} />
        <Text className='address-name'>{name}</Text>
      </View>
      <View className='right-view'>
        <Text>查看位置</Text>
        <AtIcon value={'chevron-right'} size={30} />
      </View>
    </View>
  )
}

export default AddressShowBar;
