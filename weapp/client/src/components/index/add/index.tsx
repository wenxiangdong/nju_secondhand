import {View} from "@tarojs/components";
import Taro from "@tarojs/taro";
import {AtIcon} from "taro-ui";
import "./index.scss";
import WhiteSpace from "../../white-space";
interface IProp {
  onCancel?: () => void
}
function Add(props: IProp) {
  // noinspection JSIgnoredPromiseFromCall
  Taro.setNavigationBarTitle({
    title: "发布"
  });
  // handler
  const handleClickCancel = () => {
    props.onCancel && props.onCancel();
  };

  return (
    <View className={"container"}>
      <View className={"menu-container"}>
        <View className={"menu-item"} style={{color: "rgb(62, 207, 111)"}}>
          <AtIcon value={"shopping-bag"} size={40}/>
          <View>发布闲置</View>
        </View>
        <View className={"menu-item"} style={{color: "rgb(255, 218, 0)"}}>
          <AtIcon value={"sketch"} size={40}/>
          <View>发布需求</View>
        </View>
      </View>
      <WhiteSpace height={10}/>
      <AtIcon onClick={handleClickCancel} size={30} value={"close-circle"}/>
    </View>
  );
}

export default Add;
