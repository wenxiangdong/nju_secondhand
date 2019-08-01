/**
 消息列表 一行 组件
 */
import {Image, View} from "@tarojs/components";
import Taro from "@tarojs/taro";
import "./index.scss";

const COLORS = [
  "#67D5B5",
  "#EE7785",
  "#C89EC4",
  "#84B1ED"
];

export default function MessageRow({avatar = "", name = "", extra = "", onClick = undefined}) {
  const color = COLORS[Math.floor( Math.random() * COLORS.length)];
  const avatarSection = avatar
    ? (<Image className='MR__image-avatar' src={avatar} />)
    : (
      <View className='MR__text-avatar' style={{backgroundColor: color}}>
        {name[0]}
      </View>
    );
  return (
    <View className='MR__row' onClick={onClick}>
      <View className='MR__avatar-wrapper'>
        {avatarSection}
      </View>
      <View className='MR__text-wrapper'>
        <View className='MR__text-title'>{name}</View>
        <View className='MR__text-extra'>{extra}</View>
      </View>
    </View>
  );
}
