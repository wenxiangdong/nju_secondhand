import Taro from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import {GoodsVO} from "../../../apis/GoodsApi";

interface IProp {
  goods: GoodsVO
}

/**
 * GoodsCard
 * @author 张李承
 * @create 2019/7/27 10:02
 */
function GoodsCard(props: IProp) {
  const {goods} = props;
  return (
    <View>
      <Text>GoodsCard works</Text>
    </View>
  )
}

export default GoodsCard;
