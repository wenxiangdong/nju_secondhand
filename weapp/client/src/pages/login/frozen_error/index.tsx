import Taro, {Component} from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components'
import {AtButton, AtTag} from "taro-ui";
import WhiteSpace from "../../../components/common/white-space";
import {CSSProperties} from "react";
import contactIcon from "../../../images/wechat.png";
import { apiHub } from '../../../apis/ApiHub';
import { ConfigItem } from '../../../apis/Config';

/**
 * index
 * @author 张李承
 * @create 2019/8/19 22:05
 */
export default class index extends Component {

  private email: string = apiHub.configApi.getConfig(ConfigItem.EMAIL);

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
    const SPACE_HEIGHT = 16;

    const handleClickEmail = () => {
      Taro.setClipboardData({
        data: this.email
      });
    }

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
        <Text>您的账户已被冻结，若要申请解冻</Text>
        <WhiteSpace height={SPACE_HEIGHT} />
        <Text>请通过邮件联系(点击可复制)</Text>
        <WhiteSpace height={SPACE_HEIGHT} />
        <AtTag active circle onClick={handleClickEmail}><Text>{this.email}</Text></AtTag>
        <WhiteSpace height={SPACE_HEIGHT} />
        <Text>或者</Text>
        <WhiteSpace height={SPACE_HEIGHT} />
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
