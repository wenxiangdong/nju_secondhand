import Taro from '@tarojs/taro'
import {Swiper, SwiperItem, Text, View} from '@tarojs/components'
import {ComplaintState, ComplaintVO, MockComplaintApi} from "../../../apis/ComplaintApi";
import {StyleHelper} from "../../../styles/style-helper";
import {CSSProperties} from "react";
import {timeToString} from "../../../utils/date-util";

function createStyles() {
  const baseCardStyle: CSSProperties = {
    padding: '1vw 2vw',
    margin: '1vw 2vw',
    border: StyleHelper.NORMAL_BORDER,
    width: '92vw',
    display: 'inline-flex',
    flexDirection: 'column',
    lineHeight: StyleHelper.numberToPxStr(20),
    fontSize: 'small'
  };

  const topRowViewStyle: CSSProperties = {
    display: 'inline-flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  };

  const stateInfoStyle: CSSProperties = {
    fontSize: 'x-small',
    fontWeight: 'lighter',
  };

  return {baseCardStyle, topRowViewStyle, stateInfoStyle};
}

const styles = createStyles();

interface IProp {
  complaint: ComplaintVO
}

/**
 * ComplaintCard
 * @author 张李承
 * @create 2019/8/11 20:39
 */
function ComplaintCard(props: IProp) {
  const {complaint = MockComplaintApi.createMockComplaint()} = props;
  const {orderID, complainTime, desc, state, handling, pictures} = complaint;

  const complainTimeString = timeToString(complainTime);

  let handlingTimeString;
  let handlingResult;

  if (handling) {
    handlingResult = handling.result;
    handlingTimeString = timeToString(handling.time);
  }

  return (
    <View style={styles.baseCardStyle}>
      <View style={styles.topRowViewStyle}>
        <Text>编号：{orderID}</Text>
        <Text style={styles.stateInfoStyle}>{state}</Text>
      </View>
      <Text>时间：{complainTimeString}</Text>
      <Text style={StyleHelper.BREAK_ALL_TEXT}>描述：{desc}</Text>
      {
        (pictures && pictures.length)
          ? (
            <Swiper
              indicatorColor='#999'
              indicatorActiveColor='#333'
              circular
              indicatorDots>
              {pictures.map((src, idx) => <SwiperItem key={`swiper-${idx}`} style={{backgroundImage: src}}/>)}
            </Swiper>
          )
          : null
      }
      {
        state === ComplaintState.Handled
          ? <Text>处理时间：{handlingTimeString}</Text>
          : null
      }
      {
        state === ComplaintState.Handled
          ? <Text style={StyleHelper.BREAK_ALL_TEXT}>处理结果：{handlingResult}</Text>
          : null
      }
    </View>
  )
}

export default ComplaintCard;
