import Taro from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components'
import {GoodsWithSellerVO} from "../../../apis/GoodsApi";
import localConfig from "../../../utils/local-config";
import {styleHelper} from "../../../utils/style-helper";
import {AtAvatar, AtDivider} from "taro-ui";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import {CSSProperties} from "react";
import {goodsInfoUrlConfig} from "../../../utils/url-list";

import "taro-ui/dist/style/components/flex.scss";

interface IProp {
  goodsWithSeller: GoodsWithSellerVO
}

function createStyles() {
  const margin = 5;
  const padding = 5;
  const borderWidth = 1;
  const width = Math.floor(localConfig.getSystemSysInfo().windowWidth / 4 - margin - padding - borderWidth) * 2;
  const imageBorderRadius = 4;

  const numberToPxStr = styleHelper.numberToPxStr;
  const widthAndHeightPx = numberToPxStr(width);
  const marginPx = numberToPxStr(margin);
  const paddingPx = numberToPxStr(padding);
  const borderWidthPx = numberToPxStr(borderWidth);
  const imageBorderRadiusPx = numberToPxStr(imageBorderRadius);

  const goodsCardViewStyle: CSSProperties = {
    width: widthAndHeightPx,
    margin: marginPx,
    padding: paddingPx,
    border: `${borderWidthPx} solid lightgray`,
    display: 'inline-block'
  };

  const imageStyle: CSSProperties = {
    width: widthAndHeightPx,
    height: widthAndHeightPx,
    // TODO 优先级 低
    // 检查样式
    border: 'thin sold transparent',
    borderRadius: imageBorderRadiusPx
  };

  const dividerHeight = 36;

  const goodsNameStyle: CSSProperties = {
    width: '100%',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    display: 'block'
  };

  return {
    goodsCardViewStyle,
    imageStyle,
    dividerHeight,
    goodsNameStyle
  };
}

/**
 * GoodsCard
 * @author 张李承
 * @create 2019/7/27 10:02
 */
function GoodsCard(props: IProp) {
  const {goodsWithSeller} = props;
  let card:any = null;
  if (goodsWithSeller) {
    const {goods, seller} = props.goodsWithSeller;

    const picturesCount = goods.pictures.length;
    const goodsPictureSrc = picturesCount ? goods.pictures[0] : '';
    const sellerImage = seller.avatar;
    const sellerName = seller.nickname;
    const goodsName = goods.name;
    const goodsPrice = goods.price;

    let { goodsCardViewStyle, imageStyle, dividerHeight, goodsNameStyle } = createStyles();

    const onError = createSimpleErrorHandler('GoodsCard', undefined);

    const onClick = function () {
      Taro.navigateTo({
        url: goodsInfoUrlConfig.createGoodsInfoUrl(goods._id)
      }).catch(onError);
    };

    card = (
      <View onClick={onClick} style={goodsCardViewStyle}>
        <Image style={imageStyle} src={goodsPictureSrc}/>
        <Text style={goodsNameStyle}>{goodsName}</Text>
        <Text space={'nbsp'}>￥ {goodsPrice}</Text>
        <AtDivider height={dividerHeight}/>
        <View className='at-row at-row__align--center'>
          <View className='at-col at-col-3'>
            <AtAvatar circle size={'small'} image={sellerImage}/>
          </View>
          <View className='at-col at-col__offset-1 at-col-8 at-col--wrap'>
            <Text>{sellerName}</Text>
          </View>
        </View>
      </View>
    );
  }
  return card;
}

export default GoodsCard;
