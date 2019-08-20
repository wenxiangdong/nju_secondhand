import Taro, {Component, Config} from '@tarojs/taro'
import {apiHub} from "../../apis/ApiHub";
import {createSimpleErrorHandler} from "../../utils/function-factory";
import {UserState} from "../../apis/UserApi";
import urlList from "../../utils/url-list";
import {relaunchTimeout} from "../../utils/date-util";
import localConfig from "../../utils/local-config";
import LoadingPage from "../../components/common/loading-page";

interface IState {
  loadingContent: string,
  errMsg?: string,
  sucMsg?: string,
}

/**
 * 登录
 * @author 张李承
 * @create 2019/8/13 23:44
 */
export default class index extends Component<any, IState> {

  config: Config = {
    navigationBarTitleText: '登录'
  };

  constructor(props) {
    super(props);
    this.state = {
      loadingContent: '正在检查用户状态',
    };
  }

  componentWillMount() {
    apiHub.userApi.checkState()
      .then(state => {
        if (state === UserState.Normal) {
          this.login();
        } else {
          if (state === UserState.Frozen) {
            setTimeout(() => {
              Taro.reLaunch({
                url: urlList.LOGIN_FROZEN_ERROR
              }).catch(this.onError);
            }, relaunchTimeout);
          } else if (state === UserState.UnRegistered) {
            this.setState({errMsg: '请先注册'});
            setTimeout(() => {
              Taro.reLaunch({
                url: urlList.REGISTER
              }).catch(this.onError);
            }, relaunchTimeout);
          } else {
            this.setState({errMsg: '用户信息无法识别\n请稍后重试'});
          }
        }
      })
      .catch(this.onError);
  }

  private login = () => {
    this.setState({loadingContent: '正在登录...'});
    apiHub.userApi.login()
      .then(userInfo => {
        localConfig.setUserId(userInfo._id);
        this.setState({sucMsg: '登录成功\n即将跳转主页'});
        setTimeout(() => {
          Taro.reLaunch({
            url: urlList.INDEX
          }).catch(this.onError);
        }, relaunchTimeout);
      })
      .catch(this.onError);
  };

  render() {
    const {errMsg, sucMsg, loadingContent} = this.state;
    return (
      <LoadingPage loadingMsg={errMsg || sucMsg}
                   loadingContent={loadingContent}/>
    );
  }

  private onError = createSimpleErrorHandler('login', this);
}
