import Taro from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components'
import {GoodsWithSellerVO} from "../../../apis/GoodsApi";
import localConfig from "../../../utils/local-config";
import {styleHelper} from "../../../utils/style-helper";
import {AtAvatar, AtDivider} from "taro-ui";

import './index.scss';
import {createSimpleErrorHandler} from "../../../utils/function-factory";

interface IProp {
  goodsWithSeller: GoodsWithSellerVO
}

/**
 * GoodsCard
 * @author 张李承
 * @create 2019/7/27 10:02
 */
function GoodsCard(props: IProp) {
  console.log(props);
  const {goods, seller} = props.goodsWithSeller;

  const picturesCount = goods.pictures.length;
  const goodsPictureSrc = picturesCount? goods.pictures[0]: '';
  const sellerImage = '';// TODO

  const margin = 5;
  const padding = 5;
  const borderWidth = 2;
  const width = Math.floor(localConfig.getSystemSysInfo().windowWidth / 4 - margin - padding - borderWidth) * 2;

  const numberToPxStr = styleHelper.numberToPxStr;
  const widthAndHeightPx = numberToPxStr(width);
  const marginPx = numberToPxStr(margin);
  const paddingPx = numberToPxStr(padding);
  const borderWidthPx = numberToPxStr(borderWidth);

  const onError = createSimpleErrorHandler('GoodsCard', undefined);

  const onClick = function () {
    // TODO
    Taro.navigateTo({
      url:''
    }).catch(onError);
  };

  return (
    <View onClick={onClick} className={'goods-card'} style={{width: widthAndHeightPx, margin: marginPx, padding: paddingPx, borderWidth: borderWidthPx}}>
      <Image style={{width:widthAndHeightPx, height: widthAndHeightPx}} src={goodsPictureSrc}/>
      <AtDivider/>
      <View className='at-row'>
        <View className='at-col'>
          <AtAvatar circle size={'small'} image={sellerImage}/>
        </View>
        <View className='at-col'>B</View>
        <View className='at-col'>C</View>
      </View>
      <Text>GoodsCard works</Text>
    </View>
  )
}

export default GoodsCard;
