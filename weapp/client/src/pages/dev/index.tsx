// @ts-ignore
import Taro from '@tarojs/taro';
import {View} from "@tarojs/components";
// import NjuTabBar from "../../components/nju-tab-bar";
import GoodsCard from "../../components/index/goods-card";
import {GoodsState, GoodsWithSellerVO} from "../../apis/GoodsApi";
import {Location, UserState} from "../../apis/UserApi";
import './index.scss'

function Dev() {
  // noinspection JSIgnoredPromiseFromCall
  Taro.setNavigationBarTitle({title: '测试'});

  const handleClick = () => {

  };
  const goodsWithSeller:GoodsWithSellerVO = {
    goods: {
      _id: '1',
      sellerID: '',
      name: 'name',
      desc: 'desc',
      price: '1.01',
      pictures: ['',''],
      category: {
        _id: '1',
        name: 'category',
        icon: ''
      },
      publishTime: Date.now(),
      state: GoodsState.InSale
    },
    seller: {
      _id: '1',
      _openid: 'openid',
      phone: 'phone',
      nickname: 'nickname',
      address: {
        name: 'address-name',
        address: 'address-address',
        latitude: '1',
        longitude: '1'
      },
      email: 'email',
      account: {
        balance: '1.01'
      },
      signUpTime: Date.now(),
      state: UserState.Normal
    }
  };
  return (
    <View>
      {new Array(6).fill('').map((e, idx) => {
        console.log(this, goodsWithSeller);
        return <GoodsCard key={`goodsCard-${idx}`} goodsWithSeller={goodsWithSeller}/>
      })}
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
