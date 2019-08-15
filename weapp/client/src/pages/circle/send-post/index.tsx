import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import localConfig from "../../../utils/local-config";
import urlList from "../../../utils/url-list";
import {relaunchTimeout} from "../../../utils/date-util";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import LoadingPage from "../../../components/common/loading-page";

interface IState {
  loading: boolean,
  errMsg?: string,
}

/**
 * index
 * TODO 黑锅 丢
 * @author 张李承
 * @create 2019/8/15 23:36
 */
export default class index extends Component<any, IState> {

  private readonly NOT_FIND_USER_ID_ERROR:Error = new Error('登录已失效');

  private userId:string;

  config: Config = {
    navigationBarTitleText: '发表'
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentWillMount() {
    this.userId = localConfig.getUserId();
    if (this.userId && this.userId.length) {
      this.setState({loading: false});
    } else {
      this.onNotLogin();
    }
  }

  private onNotLogin = () => {
    this.onError(this.NOT_FIND_USER_ID_ERROR);
    setTimeout(() => {
      Taro.reLaunch({
        url: urlList.LOGIN
      })
        .catch(this.onError);
    }, relaunchTimeout);
  };

  render() {
    const {loading, errMsg} = this.state;

    return (loading || errMsg)
      ? (
        <LoadingPage loadingMsg={errMsg}/>
      )
      : (
        <View>
          <Text>index works</Text>
        </View>
      )
  }

  private onError = createSimpleErrorHandler('PlatformAccount', this);
}
