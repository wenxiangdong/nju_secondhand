import Taro from '@tarojs/taro'
import {View} from '@tarojs/components'
import {AtActivityIndicator, AtToast} from "taro-ui";
import localConfig from "../../../utils/local-config";

interface IProp {
  errMsg?: string
}

/**
 * LoadingPage
 * @author 张李承
 * @create 2019/7/26 10:02
 */
function LoadingPage(props: IProp) {
  const {errMsg} = props;
  const windowHeight = localConfig.getSystemSysInfo().windowHeight;
  return (
    errMsg
      ? (<AtToast isOpened text={errMsg}/>)
      : (
        <View style={{position: 'relative', height: `${windowHeight}px`}}>
          <AtActivityIndicator content='加载中...' size={32} mode='center'/>
        </View>
      )
  );
}

export default LoadingPage;
