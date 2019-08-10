import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import LoadingPage from "../../../components/common/loading-page";
import localConfig from "../../../utils/local-config";
import {apiHub} from "../../../apis/ApiHub";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import {AtButton, AtCard} from "taro-ui";
import {MockUserApi, UserVO} from "../../../apis/UserApi";
import urlList from "../../../utils/url-list";
import ConfirmModal from "../../../components/common/confirm-modal";

interface IState {
  loading: boolean,
  withdrawAvailable: boolean,
  user?: UserVO,
  isWithdrawing: boolean,
  withdrawLoading: boolean,
  errMsg?: string,
  sucMsg?: string,
}

/**
 * 平台账户
 * @create 2019/7/25 11:49
 */
export class index extends Component<any, IState> {

  private readonly NOT_FIND_USER_ID_ERROR:Error = new Error('登录已失效');

  private userId:string;

  config: Config = {
    navigationBarTitleText: '平台账户'
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      withdrawLoading: false,
      isWithdrawing: false,
      withdrawAvailable: new Date(localConfig.getWithdrawTime() || 0).toDateString()
        !== new Date(Date.now()).toDateString()
    };
  }

  componentWillMount() {
    this.userId = localConfig.getUserId();
    this.refreshUserInfo();
  }

  private refreshUserInfo = () => {
    if (this.userId && this.userId.length) {
      apiHub.userApi.getUserInfo(this.userId)
        .then(user => this.setState({user, loading: false}))
        .catch(this.onError);
    } else {
      this.onNotLogin();
    }
  };

  private handleWithdraw = () => {
    this.setState({isWithdrawing: true, withdrawLoading: false, errMsg: undefined, sucMsg: undefined})
  };

  private handleCancel = () => {
    this.setState({isWithdrawing: false, withdrawLoading: false, errMsg: undefined, sucMsg: undefined});
  };

  private handleConfirm = () => {
    const that = this;
    this.setState({withdrawLoading: true}, function() {
      const {user} = that.state;
      if (user) {
        apiHub.accountApi.withdraw(user.account.balance)
          .then(function () {
            const sucMsg = '提现完成';
            that.setState({sucMsg, withdrawLoading: false}, function () {
              setTimeout(function () {
                Taro.reLaunch({
                  url: urlList.MY
                }).catch(that.onError);
              }, 1000);
            });
            localConfig.setWithdrawTime(Date.now());
          })
          .catch(that.onError);
      } else {
        that.onNotLogin();
      }
    });
  };

  private onNotLogin = () => {
    this.onError(this.NOT_FIND_USER_ID_ERROR);
  };

  render() {
    const {loading, errMsg, withdrawAvailable, user = MockUserApi.createMockUser(), isWithdrawing, withdrawLoading, sucMsg} = this.state;
    const {nickname, account} = user;
    const {balance} = account;

    const atModalContent = `总计￥${balance}`;
    const atCardNode = withdrawAvailable? '每天只能提现一次哦': '今天已经不能提现了，请明天再来';

    return (loading || (!withdrawLoading && errMsg))
      ? (
        <LoadingPage errMsg={errMsg}/>
      )
      : (
        <View>

          {
            isWithdrawing
              ? (
                <ConfirmModal loading={withdrawLoading}
                              onCancel={this.handleCancel}
                              onConfirm={this.handleConfirm}
                              errMsg={errMsg}
                              sucMsg={sucMsg}
                              title="提现确认"
                              content={atModalContent}/>
              )
              : null
          }

          <AtCard
            note={atCardNode}
            extra={nickname}
            title="平台账户"
          >
            ￥{account.balance}
          </AtCard>

          {
            withdrawAvailable
              ?  (
                <AtButton type='primary'
                          customStyle={{position: 'fixed', bottom: 0, left: 0, width: '100%'}}
                          onClick={this.handleWithdraw}>
                  全部提现
                </AtButton>
              )
              : null
          }

        </View>
      )
    ;
  }

  private onError = createSimpleErrorHandler('PlatformAccount', this);
}
