import Taro from '@tarojs/taro'
import {View} from '@tarojs/components'
import {AtActivityIndicator, AtToast} from "taro-ui";
import localConfig from "../../../utils/local-config";

interface IProp {
  loadingMsg?: string,
  loadingContent?: string,
}

/**
 * LoadingPage
 * TODO 优先级 低 考虑添加点击重试
 * @author 张李承
 * @create 2019/7/26 10:02
 */
function LoadingPage(props: IProp) {
  const {loadingMsg, loadingContent = '加载中...'} = props;
  const sysInfo = localConfig.getSystemSysInfo();
  const {windowHeight, windowWidth} = sysInfo;
  return (
    loadingMsg
      ? (<AtToast isOpened text={loadingMsg}/>)
      : (
        <View style={{position: 'absolute', left: '0', top: '0', zIndex: 1000, width: `${windowWidth}px`, height: `${windowHeight}px`}}>
          <AtActivityIndicator content={loadingContent} size={32} mode='center'/>
        </View>
      )
  );
}

export default LoadingPage;
