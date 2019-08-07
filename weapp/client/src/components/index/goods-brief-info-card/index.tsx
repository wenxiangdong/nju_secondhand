import Taro from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import {GoodsWithSellerVO, MockGoodsApi} from "../../../apis/GoodsApi";
import AddressShowBar from "../address-show-bar";
import UserBriefInfoBar from "../../common/user-brief-info-bar";

import "taro-ui/dist/style/components/flex.scss";
import "./index.scss"

interface IProp {
  goodsWithSeller: GoodsWithSellerVO
}

/**
 * GoodsBriefInfoCard
 * @author 张李承
 * @create 2019/7/31 23:17
 */
function GoodsBriefInfoCard(props: IProp) {
  const {goodsWithSeller = MockGoodsApi.createMockGoodsWithSeller()} = props;
  const {seller, goods} = goodsWithSeller;
  const {address} = seller;
  const {price, name} = goods;
  return (
    <View className={'goods-card'}>
      <View>
        <UserBriefInfoBar user={seller}/>
      </View>
      <View>
        <Text>{name}</Text>
      </View>
      <View>
        <Text space={'nbsp'}>￥ {price}</Text>
      </View>
      <View>
        <AddressShowBar address={address}/>
      </View>
    </View>
  );
}

export default GoodsBriefInfoCard;
