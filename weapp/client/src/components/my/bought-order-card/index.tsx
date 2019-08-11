import Taro from '@tarojs/taro'
import {Text, View} from '@tarojs/components'
import {MockOrderApi, OrderState, OrderVO} from '../../../apis/OrderApi';
import {sendComplaintUrlConfig} from '../../../utils/url-list';
import {createSimpleErrorHandler} from '../../../utils/function-factory';
import {StyleHelper} from '../../../styles/style-helper';
import {CSSProperties} from 'react';
import {AtButton} from 'taro-ui';
import {timeToString} from '../../../utils/date-util';
import WhiteSpace from '../../common/white-space';

interface IProp {
  order: OrderVO,
  onAccept?: () => void,
  isBuyer: boolean
}

/**
 * BoughtOrderCard
 * @author 张李承
 * @create 2019/8/11 10:20
 */
function BoughtOrderCard(props: IProp) {
  const {order = MockOrderApi.createMockOrder(), onAccept, isBuyer} = props;

  const onError = createSimpleErrorHandler('BoughtOrderCard');

  const onComplaint = function () {
    Taro.navigateTo({
      url: sendComplaintUrlConfig.createUrl(order._id)
    }).catch(onError);
  };

  const {goodsName, goodsPrice, orderTime, deliveryTime, state} = order;

  const orderTimeString = timeToString(orderTime);
  const deliveryTimeString = deliveryTime > 0? timeToString(deliveryTime): '暂未送达';

  const {baseCardStyle, atButtonGroupStyle, atButtonStyle, mainColumnStyle, subColumnStyle, dateStringStyle} = createStyles();

  return (
    <View style={baseCardStyle}>
      <View style={mainColumnStyle}>
        <Text>{goodsName}</Text>
        <Text>￥ {goodsPrice}</Text>
        <WhiteSpace height={10}/>
        <Text style={dateStringStyle}>下单日期: {orderTimeString}</Text>
        <Text style={dateStringStyle}>收货日期: {deliveryTimeString}</Text>
      </View>
      <View style={subColumnStyle}>
        <Text style={dateStringStyle}>订单状态：{state}</Text>
        <View style={atButtonGroupStyle}>
          <AtButton circle type='secondary' customStyle={atButtonStyle} onClick={() => onComplaint()}>反馈</AtButton>
          {
            state === OrderState.Ongoing && isBuyer && onAccept
              ? <AtButton circle type='primary' customStyle={atButtonStyle} onClick={() => onAccept()}>收货</AtButton>
              : null
          }
        </View>
      </View>
    </View>
  )
}

export default BoughtOrderCard;

function createStyles() {
  const numberToPxStr = StyleHelper.numberToPxStr;

  const buttonHeight = 26;
  const buttonHeightPx = numberToPxStr(buttonHeight);
  const atButtonStyle:CSSProperties = {
    height: buttonHeightPx,
    lineHeight: buttonHeightPx,
    margin: '1vw'
  };

  const atButtonGroupStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'row',
    justifyContent: 'center'
  };

  const baseCardStyle: CSSProperties = {
    padding: '1vw 2vw',
    margin: '1vw 2vw',
    border: StyleHelper.NORMAL_BORDER,
    width: '92vw',
    display: 'inline-flex',
    flexDirection: 'row',
    alignItems: 'center'
  };

  const lineHeight = 18;
  const lineHeightPx = numberToPxStr(lineHeight);
  const height = 100;
  const heightPx = numberToPxStr(height);
  const columnStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: heightPx,
    lineHeight: lineHeightPx,
    padding: '2vw 1vw',
  };

  const mainColumnStyle: CSSProperties = {
    flex: 1,
    ...columnStyle
  };

  const subColumnStyle: CSSProperties = {
    textAlign: 'center',
    ...columnStyle
  };

  const dateStringStyle: CSSProperties = {
    fontSize: 'x-small',
    fontWeight: 'lighter'
  };

  return {baseCardStyle, atButtonGroupStyle, atButtonStyle, mainColumnStyle, subColumnStyle, dateStringStyle};
}
