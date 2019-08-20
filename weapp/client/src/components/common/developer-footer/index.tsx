import Taro, { useState, useEffect } from "@tarojs/taro";
import { apiHub } from "../../../apis/ApiHub";
import { ConfigItem } from "../../../apis/Config";
import { View, Text } from "@tarojs/components";
import { AtCurtain, AtTag, AtCard } from "taro-ui";
import WhiteSpace from "../white-space";
import { CSSProperties } from "react";

export default function DeveloperFooter() {
    const [developerInfo, setInfo] = useState({});
    const [open, setOpen] = useState(false);
    useEffect(() => {
        const res = apiHub.configApi.getConfig(ConfigItem.DEVELOPER);
        setInfo({
            ...res
        });
    }, []); 

    const itemTitleStyle: CSSProperties = {
        color: "black",
        fontSize: "1.2em"
    };

    return (
        <View 
        onClick={() => setOpen(true)}
        style={{
            width: "100%", boxSizing: "border-box", 
            display: "flex", justifyContent: "center", alignItems: "center",
            padding: "16px"
            }}>
            <View style={{
                color: "#C9C9C9"
            }}>
                <Text decode space="nbsp">{developerInfo.team}</Text>
            </View>

            <AtCurtain isOpened={open} onClose={() => setOpen(false)} closeBtnPosition='bottom'>
                <AtCard title={developerInfo.team} note='欢迎恰谈合作'>
                    <View style={{
                        boxSizing: "border-box",
                        backgroundColor: "white",
                        padding: "16px"
                    }}>
                        {/* <View style={{fontSize: "24px"}}>{developerInfo.team}</View> */}
                        {/* <WhiteSpace height={16} /> */}
                        <View style={itemTitleStyle}>联系邮箱</View>
                        <View>{developerInfo.email}</View>
                        <View style={{textAlign: "right"}}>
                            <Text 
                            onClick={() => Taro.setClipboardData({data: developerInfo.email})}
                            style={{
                                color: "#C9C9C9"
                            }}>复制</Text>
                        </View>
                        <WhiteSpace height={16}/>
                        <View style={itemTitleStyle}>开发人员</View>
                        <View>{developerInfo.members.join("，")}</View>
                    </View>
                </AtCard>
            </AtCurtain>
        </View>
    );
}