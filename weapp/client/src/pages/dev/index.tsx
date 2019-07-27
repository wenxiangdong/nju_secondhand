// @ts-ignore
import Taro from '@tarojs/taro';
import {View} from "@tarojs/components";
// import NjuTabBar from "../../components/nju-tab-bar";
import GoodsCard from "../../components/index/goods-card";
import {GoodsState, GoodsWithSellerVO, MockGoodsApi} from "../../apis/GoodsApi";
import {Location, MockUserApi, mockUserApi, UserState} from "../../apis/UserApi";
import './index.scss'
import {apiHub} from "../../apis/ApiHub";

function Dev() {
  // noinspection JSIgnoredPromiseFromCall
  Taro.setNavigationBarTitle({title: '测试'});

  const handleClick = () => {

  };
  return (
    <View>
      {new Array(6).fill('').map((e, idx) => <GoodsCard key={`goodsCard-${idx}`} goodsWithSeller={MockGoodsApi.createMockGoodsWithSeller()}/>)}
      {/*{*/}
        {/*Array(30)*/}
          {/*.fill(0)*/}
          {/*.map((_, index) => (*/}
            {/*<View  key={index}  style={{marginTop: "10px"}}>*/}
              {/*<AtButton onClick={handleClick}>hello</AtButton>*/}
            {/*</View>*/}
          {/*))*/}
      {/*}*/}
      {/*<WhiteSpace height={50}/>*/}
      {/*/!*<NjuTabBar/>*!/*/}
    </View>
  )
}

Dev.config = {
  navigationBarTitleText: "试验"
};

export default Dev;
