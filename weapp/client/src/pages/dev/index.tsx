// @ts-ignore
import Taro from '@tarojs/taro';
import {View} from "@tarojs/components";
import GoodsCard from "../../components/index/goods-card";
import {MockGoodsApi} from "../../apis/GoodsApi";
import './index.scss'

function Dev() {
  // noinspection JSIgnoredPromiseFromCall
  Taro.setNavigationBarTitle({title: '测试'});

  return (
    <View>
      {new Array(6).fill('').map((e, idx) => <GoodsCard key={`goodsCard-${e}-${idx}`} goodsWithSeller={MockGoodsApi.createMockGoodsWithSeller()}/>)}
    </View>
  )
}

Dev.config = {
  navigationBarTitleText: "试验"
};

// @ts-ignore
export default Dev;
