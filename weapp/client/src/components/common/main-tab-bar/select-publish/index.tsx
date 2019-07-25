import {View} from "@tarojs/components";
import Taro from "@tarojs/taro";
import {AtIcon} from "taro-ui";
import "./index.scss";
import WhiteSpace from '../../../common/white-space';
import {createSimpleErrorHandler} from "../../../../utils/function-factory";

interface IProp {
  onCancel?: () => void,
  previousTitle: string,
  title: string
}
function SelectPublish(props: IProp) {
  const {onCancel, previousTitle, title} = props;

  const onError = createSimpleErrorHandler('SelectPublish', this);

  if (title) {
    Taro.setNavigationBarTitle({title})
      .catch((e) => onError(e));
  }

  // handler
  const handleClickCancel = () => {
    Taro.setNavigationBarTitle({title: previousTitle})
      .catch((e) => onError(e));

    onCancel && onCancel();
  };

  // TODO 优先级 低 warning
  // 应该是 AtIcon 的 value 属性有问题 猜测 待修正
  // Warning: Failed prop type: Invalid prop `maxValue` of type `string` supplied to `AtBadge`, expected `number`.
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

export default SelectPublish;
