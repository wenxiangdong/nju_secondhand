import Taro from '@tarojs/taro';
import {View, Text} from "@tarojs/components";
import './index.scss'
import BoughtOrderCard from "../../components/my/bought-order-card";
import {MockOrderApi} from "../../apis/OrderApi";

function Dev() {

  return (
    <View>
      <BoughtOrderCard order={MockOrderApi.createMockOrder()} onAccept={() => console.log('accept')} isBuyer={false}/>
    </View>
  )
}

Dev.config = {
  navigationBarTitleText: "试验"
};

export default Dev;
