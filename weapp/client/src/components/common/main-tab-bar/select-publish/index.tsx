import {View} from "@tarojs/components";
import Taro from "@tarojs/taro";
import {AtIcon} from "taro-ui";
import "./index.scss";
import WhiteSpace from '../../../common/white-space';
import {createSimpleErrorHandler} from "../../../../utils/function-factory";
import urlList, {sendPostUrlConfig} from "../../../../utils/url-list";

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
      .catch(onError);
  }

  // handler
  const handleClickCancel = () => {
    Taro.setNavigationBarTitle({title: previousTitle})
      .catch(onError);

    onCancel && onCancel();
  };

  const handleClickPublish = () => {
    Taro.navigateTo({
      url: urlList.PUBLISH_GOODS
    });
  };

  const handleClickRequest = () => {
    // @ts-ignore
    sendPostUrlConfig.go({
      topic: "重金悬赏"
    });
  };

  // TODO 优先级 低 warning
  // 应该是 AtIcon 的 value 属性有问题 猜测 待修正
  // 上面猜的不对 再看吧
  // Warning: Failed prop type: Invalid prop `maxValue` of type `string` supplied to `AtBadge`, expected `number`.
  return (
    <View className={"container"}>
      <View className={"menu-container"}>
        <View onClick={handleClickPublish} className={"menu-item"} style={{color: "rgb(62, 207, 111)"}}>
          <AtIcon value={"shopping-bag"} size={40}/>
          <View>发布闲置</View>
        </View>
        <View onClick={handleClickRequest} className={"menu-item"} style={{color: "rgb(255, 218, 0)"}}>
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
