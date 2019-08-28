import {AtAvatar, AtButton} from "taro-ui";
import {Block, Image, Text, View} from "@tarojs/components";
import Taro, {Config, useEffect, useState} from "@tarojs/taro";
import WhiteSpace from "../../components/common/white-space";
import {CSSProperties} from "react";
import LoadingPage from "../../components/common/loading-page";
import {chatUrlConfig, userInfoUrlConfig} from "../../utils/url-list";
import "@tarojs/async-await";
import {apiHub} from "../../apis/ApiHub";
import {UserVO} from "../../apis/UserApi";
import DLocation from "../../components/common/d-location/DLocation";

export default function UserInfo() {
  const [user, setUser] = useState({} as UserVO);
  const [loading, setLoading] = useState(true);
  const [hasError, setError] = useState(false);

  useEffect(() => {
    const userId = userInfoUrlConfig.getUserId(this);
    console.log(userId);
    loadUserInfo(userId);
  }, []);


  const loadUserInfo = async (userId) => {
    setLoading(true);
    try {
      const res = await apiHub.userApi.getUserInfo(userId);
      setUser({...res});
      console.log("请求得到user", res);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }

  };


  const COLOR = "#C9C9C9";

  const itemTitleStyle: CSSProperties = {
    color: "black",
    // fontSize: ""
  };


  const handleClickToChat = () => {
    chatUrlConfig.go({
      id: user._id
    });
  };

  return (
    <View style={{
      color: COLOR,
      width: "100%", boxSizing: "border-box",
      display: "flex", justifyContent: "center",
      flexDirection: "column",
      padding: "16px",
      position: "relative",
      backgroundColor: "white",
    }}
    >
      {
        loading
          ? <LoadingPage />
          : (
            hasError
              ? <View>加载用户信息错误，请返回重试</View>
              : (
                <Block>
                  <View style={itemTitleStyle}>用户头像</View>
                  {/*<Image src={user.avatar} />*/}
                  <AtAvatar image={user.avatar} />
                  <WhiteSpace height={8} />
                  <View style={itemTitleStyle}>用户昵称</View>
                  <View>{user && user.nickname}</View>
                  <WhiteSpace height={8} />
                  <View style={itemTitleStyle}>联系邮箱</View>
                  <View>{user && user.email}</View>
                  <View style={{textAlign: "right"}}>
                    <Text
                      onClick={() => Taro.setClipboardData({data: user ? user.email : ""})}
                      style={{
                        color: "#C9C9C9"
                      }}
                    >复制</Text>
                  </View>
                  <WhiteSpace height={8} />
                  <View style={itemTitleStyle}>电话</View>
                  <View>{user && user.phone}</View>
                  <View style={{textAlign: "right"}}>
                    <Text
                      onClick={() => Taro.makePhoneCall({phoneNumber: user ? user.phone : ""})}
                      style={{
                        color: "#C9C9C9"
                      }}
                    >拨打</Text>
                  </View>
                  <WhiteSpace height={8} />
                  <View style={itemTitleStyle}>地址</View>
                  {/*<View>{user && user.nickname}</View>*/}
                  <Text>{user.address.name}</Text>
                  <Text>{user.address.address}</Text>
                  <View style={{textAlign: "right"}}>
                    <Text
                      onClick={() => Taro.setClipboardData({data: user ? user.address.address : ""})}
                      style={{
                        color: "#C9C9C9"
                      }}
                    >复制</Text>
                  </View>
                  <WhiteSpace height={60} />

                  <View style={{
                    position: "fixed",
                    bottom: "0",
                    right: "0",
                    left: "0",
                    zIndex: 10000000000
                  }}>
                    <AtButton type='primary' onClick={handleClickToChat}>去聊天</AtButton>
                  </View>
                </Block>
              )
          )
      }
    </View>
  );
}

UserInfo.config = {
  navigationBarTitleText: "用户信息"
} as Config;
