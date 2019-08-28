import Taro from '@tarojs/taro'
import {Text, View} from '@tarojs/components'
import {MockOrderApi, OrderState, OrderVO} from '../../../apis/OrderApi';
import {sendComplaintUrlConfig, userInfoUrlConfig} from '../../../utils/url-list';
import {createSimpleErrorHandler} from '../../../utils/function-factory';
import {StyleHelper} from '../../../styles/style-helper';
import {CSSProperties} from 'react';
import {AtIcon} from 'taro-ui';
import {timeToString} from '../../../utils/date-util';
import WhiteSpace from '../../common/white-space';

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
    textAlign: 'right',
    ...columnStyle
  };

  const dateStringStyle: CSSProperties = {
    fontSize: 'x-small',
    fontWeight: 'lighter'
  };

  return {baseCardStyle, atButtonGroupStyle, atButtonStyle, mainColumnStyle, subColumnStyle, dateStringStyle};
}

const styles = createStyles();

interface IProp {
  order: OrderVO,
  onAccept?: () => void,
  isComplaint?: boolean,
  isBuyer: boolean
}

/**
 * BoughtOrderCard
 * @author 张李承
 * @create 2019/8/11 10:20
 */
function BoughtOrderCard(props: IProp) {
  const {order = MockOrderApi.createMockOrder(), onAccept, isBuyer, isComplaint} = props;

  const onError = createSimpleErrorHandler('BoughtOrderCard');

  const onComplaint = function () {
    Taro.navigateTo({
      url: sendComplaintUrlConfig.createUrl(order._id)
    }).catch(onError);
  };

  const {goodsName, goodsPrice, orderTime, deliveryTime, state} = order;

  const orderTimeString = timeToString(orderTime);
  const deliveryTimeString = deliveryTime > 0? timeToString(deliveryTime): '暂未送达';

  let stateInfo;
  switch (state) {
    case OrderState.Finished:
      stateInfo = '已送达';
      break;
    case OrderState.Ongoing:
      stateInfo = '送货中';
      break;
    case OrderState.Paying:
      stateInfo = '付款中';
      break;
    default:
      stateInfo = '状态不明'
  }


  const handleClickMenu = async () => {
    const menuList = [
      {
        label: "反馈",
        onClick: () => onComplaint()
      },
    ];
    if (isBuyer) {
      menuList.unshift({
        label: "卖家信息",
        onClick: () => {
          userInfoUrlConfig.go(order.sellerID);
        }
      });
      if (state === OrderState.Ongoing) {
        menuList.unshift({
          label: "收货",
          onClick: () => onAccept && onAccept()
        });
      }
    } else if (!isBuyer) {
      menuList.unshift({
        label: "买家信息",
        onClick: () => {
          userInfoUrlConfig.go(order.buyerID);
        }
      })
    }
    try {
      const res = await Taro.showActionSheet({
        itemList: menuList.map(item => item.label),
      });
      const item = menuList[res.tapIndex];
      item && item.onClick();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.baseCardStyle}>
      <View style={styles.mainColumnStyle}>
        <Text style={{fontSize: "1.2em"}}>{goodsName}</Text>
        <WhiteSpace height={8}/>
        <Text>￥ {goodsPrice}</Text>
        <WhiteSpace height={16}/>
        <Text style={styles.dateStringStyle}>下单日期: {orderTimeString}</Text>
        <Text style={styles.dateStringStyle}>收货日期: {deliveryTimeString}</Text>
      </View>
      <View style={styles.subColumnStyle}>
        <Text style={styles.dateStringStyle}>订单状态：{stateInfo}</Text>
        <AtIcon value='menu' color='rgb(62, 207, 111)' onClick={handleClickMenu} />
        {/*{*/}
        {/*  isComplaint*/}
        {/*    ? null*/}
        {/*    : (*/}
        {/*      <View style={styles.atButtonGroupStyle}>*/}
        {/*        <AtButton circle type='secondary' customStyle={styles.atButtonStyle} onClick={() => onComplaint()}>反馈</AtButton>*/}
        {/*        {*/}
        {/*          state === OrderState.Ongoing && isBuyer && onAccept !== undefined*/}
        {/*            ? <AtButton circle type='primary' customStyle={styles.atButtonStyle} onClick={() => onAccept()}>收货</AtButton>*/}
        {/*            : null*/}
        {/*        }*/}
        {/*      </View>*/}
        {/*    )*/}
        {/*}*/}
      </View>
    </View>
  )
}

export default BoughtOrderCard;
