import Taro from '@tarojs/taro';
import {View, Text} from "@tarojs/components";
import './index.scss'
import SoldGoodsCard from "../../components/my/sold-goods-card";
import {MockGoodsApi} from "../../apis/GoodsApi";

function Dev() {
  const goods = MockGoodsApi.createMockGoods();

  return (
    <View>
      <SoldGoodsCard goods={goods} onDeleteGoods={() => console.log('delete goods'}/>
    </View>
  )
}

Dev.config = {
  navigationBarTitleText: "试验"
};

export default Dev;
