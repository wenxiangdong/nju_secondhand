import Taro, {Config, useState} from "@tarojs/taro";
import {Button, Image, View, Text} from "@tarojs/components";
import {AtButton} from "taro-ui";
import formIcon from "../../../../images/complaint.png";
import contactIcon from "../../../../images/wechat.png";
import {CSSProperties} from "react";
import WhiteSpace from "../../../../components/common/white-space";

export default function NewComplaint() {
  // styles
  const imageStyle: CSSProperties = {
    width: "64rpx",
    height: "64rpx",
    marginRight: "1em"
  };
  const buttonContentStyle: CSSProperties = {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center"
  };
  return (
    <View>
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
        <View>
          <AtButton onClick={() => null}>
            <View style={buttonContentStyle}>
              <Image src={formIcon} style={imageStyle} />
              <Text>新建一个投诉单</Text>
            </View>
          </AtButton>
          <WhiteSpace height={24} />
          <AtButton openType='contact'>
            <View style={buttonContentStyle}>
              <Image src={contactIcon} style={imageStyle} />
              <Text>直接联系客服</Text>
            </View>
          </AtButton>
        </View>
      </View>
    </View>
  );
}

NewComplaint.config = {
  navigationBarTitleText: "投诉"
} as Config;
