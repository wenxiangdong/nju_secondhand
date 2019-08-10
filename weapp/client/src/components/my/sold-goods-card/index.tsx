import Taro from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components'
import {GoodsVO, MockGoodsApi} from "../../../apis/GoodsApi";
import localConfig from "../../../utils/local-config";
import {StyleHelper} from "../../../utils/style-helper";
import {CSSProperties} from "react";
import {AtButton} from "taro-ui";

interface IProp {
  goods: GoodsVO,
  onDeleteGoods: () => void
}

/**
 * SoldGoodsCard
 * @author 张李承
 * @create 2019/8/10 21:37
 */
function SoldGoodsCard(props: IProp) {
  const {goods = MockGoodsApi.createMockGoods(), onDeleteGoods} = props;

  const picSrc = goods.pictures[0];
  const {name, publishTime, price} = goods;

  const publishTimeDateString = new Date(publishTime).toLocaleDateString();

  const {baseCardStyle, picStyle, atButtonStyle, mainColumnStyle, subColumnStyle, dateStringStyle} = createStyles();

  return (
    <View style={baseCardStyle}>
      <Image src={picSrc} style={picStyle} />
      <View style={mainColumnStyle}>
        <Text>{name}</Text>
        <Text>￥ {price}</Text>
      </View>
      <View style={subColumnStyle}>
        <Text style={dateStringStyle}>{publishTimeDateString}</Text>
        <AtButton circle type='secondary' customStyle={atButtonStyle} onClick={() => onDeleteGoods()}>下架</AtButton>
      </View>
    </View>
  )
}

export default SoldGoodsCard;

function createStyles() {
  const numberToPxStr = StyleHelper.numberToPxStr;

  const picSize = Math.floor(localConfig.getSystemSysInfo().windowWidth / 4);
  const picSizePx = numberToPxStr(picSize);
  const picStyle: CSSProperties = {
    width: picSizePx,
    height: picSizePx,
  };

  const buttonHeight = 26;
  const buttonHeightPx = numberToPxStr(buttonHeight);
  const atButtonStyle:CSSProperties = {
    height: buttonHeightPx,
    lineHeight: buttonHeightPx
  };

  const baseCardStyle: CSSProperties = {
    padding: '1vw 2vw',
    margin: '1vw 2vw',
    border: StyleHelper.NORMAL_BORDER,
    width: '92vw',
    display: 'inline-flex',
    flexDirection: "row",
    alignItems: "center"
  };

  const lineHeight = 18;
  const lineHeightPx = numberToPxStr(lineHeight);
  const columnStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: "column",
    justifyContent: "space-between",
    height: picSizePx,
    lineHeight: lineHeightPx,
    padding: '2vw 1vw',
  };

  const mainColumnStyle: CSSProperties = {
    flex: 1,
    ...columnStyle
  };

  const subColumnStyle: CSSProperties = {
    textAlign: "center",
    ...columnStyle
  };

  const dateStringStyle: CSSProperties = {
    fontSize: 'x-small',
    fontWeight: 'lighter'
  };

  return {baseCardStyle, picStyle, atButtonStyle, mainColumnStyle, subColumnStyle, dateStringStyle};
}
