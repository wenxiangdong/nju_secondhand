import Taro from '@tarojs/taro'
import {View} from '@tarojs/components'
import {AtActivityIndicator, AtToast} from "taro-ui";
import localConfig from "../../../utils/local-config";

interface IProp {
  errMsg?: string
}

/**
 * LoadingPage
 * TODO 优先级 低 考虑添加点击重试
 * @author 张李承
 * @create 2019/7/26 10:02
 */
function LoadingPage(props: IProp) {
  const {errMsg} = props;
  const sysInfo = localConfig.getSystemSysInfo();
  const {windowHeight, windowWidth} = sysInfo;
  return (
    errMsg
      ? (<AtToast isOpened text={errMsg}/>)
      : (
        <View style={{position: 'absolute', left: '0', top: '0', zIndex: 1000, width: `${windowWidth}px`, height: `${windowHeight}px`}}>
          <AtActivityIndicator content='加载中...' size={32} mode='center'/>
        </View>
      )
  );
}

export default LoadingPage;
