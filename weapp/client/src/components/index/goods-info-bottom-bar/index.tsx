import Taro from '@tarojs/taro'
import {View} from '@tarojs/components'
import {GoodsWithSellerVO, MockGoodsApi} from "../../../apis/GoodsApi";
import WhiteSpace from "../../common/white-space";
import {AtButton} from "taro-ui";
import {CSSProperties} from "react";

import "taro-ui/dist/style/components/flex.scss";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import {buyUrlConfig, chatUrlConfig} from "../../../utils/url-list";

interface IProp {
  goodsWithSeller: GoodsWithSellerVO
}

/**
 * GoodsInfoBottomBar
 * @author 张李承
 * @create 2019/8/4 11:05
 */
function GoodsInfoBottomBar(props: IProp) {
  const {goodsWithSeller = MockGoodsApi.createMockGoodsWithSeller()} = props;

  const onError = createSimpleErrorHandler('GoodsInfoBottomBar', undefined);

  const buy = function () {
    Taro.navigateTo({
      url: buyUrlConfig.createChatUrl(goodsWithSeller.goods._id)
    }).catch(onError);
  };

  const chat = function () {
    Taro.navigateTo({
      url: chatUrlConfig.createChatUrl(goodsWithSeller.seller._id)
    }).catch(onError);
  };

  const {atButtonStyle, bottomBarStyle} = createStyles();

  return (
    <View>
      <WhiteSpace height={50}/>

      <View className='at-row' style={bottomBarStyle}>
        <View className='at-col at-col__offset-1 at-col-4'>
          <AtButton circle type='secondary' customStyle={atButtonStyle} onClick={buy}>马上买</AtButton>
        </View>
        <View className='at-col at-col__offset-2 at-col-4'>
          <AtButton circle type='primary' customStyle={atButtonStyle} onClick={chat}>聊一聊</AtButton>
        </View>
      </View>
    </View>
  )
}

function createStyles() {
  const atButtonStyle:CSSProperties = {
    height: '30px',
    lineHeight: '30px'
  };

  const bottomBarStyle:CSSProperties = {
    height: '40px',
    paddingTop: '10px',
    backgroundColor: 'white',
    zIndex: 200,
    position: 'fixed',
    left: '0',
    bottom: '0'
  };

  return {
    atButtonStyle,
    bottomBarStyle
  };
}

export default GoodsInfoBottomBar;
