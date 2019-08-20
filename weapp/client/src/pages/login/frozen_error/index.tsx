import Taro, {Component} from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components'
import {AtButton} from "taro-ui";
import WhiteSpace from "../../../components/common/white-space";
import {CSSProperties} from "react";
import contactIcon from "../../../images/wechat.png";

/**
 * index
 * @author 张李承
 * @create 2019/8/19 22:05
 */
export default class index extends Component {

  private email: string = 'wenxiangdong@outlook.com';

  render() {
    const buttonContentStyle: CSSProperties = {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center"
    };
    const imageStyle: CSSProperties = {
      width: "64rpx",
      height: "64rpx",
      marginRight: "1em"
    };
    return (
      <View style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 100rpx",
        width: "100vw",
        height: "100vh",
        boxSizing: "border-box"
      }}>
        <Text>您的账户已被冻结</Text>
        <WhiteSpace height={24} />
        <Text>请与管理员联系</Text>
        <WhiteSpace height={24} />
        <Text>{this.email}</Text>
        <WhiteSpace height={24} />
        <AtButton openType='contact'>
          <View style={buttonContentStyle}>
            <Image src={contactIcon} style={imageStyle} />
            <Text>联系客服留言</Text>
          </View>
        </AtButton>
      </View>
    )
  }
}
