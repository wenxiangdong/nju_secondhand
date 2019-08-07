import Taro, {Component, Config} from '@tarojs/taro'
import {View, Button, Text} from '@tarojs/components'
import LoadingPage from "../../../components/common/loading-page";
import localConfig from "../../../utils/local-config";
import {apiHub} from "../../../apis/ApiHub";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import {AtActivityIndicator, AtButton, AtCard, AtModal, AtModalAction, AtModalContent, AtModalHeader} from "taro-ui";
import {MockUserApi, UserVO} from "../../../apis/UserApi";
import urlList from "../../../utils/url-list";

interface IState {
  loading: boolean,
  modalLoading: boolean,
  errMsg?: string,
  sucMsg?: string,
  isWithdrawing: boolean,
  withdrawAvailable: boolean,
  user?: UserVO,
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
      modalLoading: false,
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

  private handleCancel = () => {
    this.setState({isWithdrawing: false});
  };

  private handleConfirm = () => {
    const that = this;
    this.setState({modalLoading: true}, function() {
      const {user} = that.state;
      if (user) {
        apiHub.accountApi.withdraw(user.account.balance)
          .then(function () {
            const sucMsg = '提现完成';
            that.setState({sucMsg}, function () {
              setTimeout(function () {
                localConfig.setWithdrawTime(Date.now());
                Taro.reLaunch({
                  url: urlList.MY
                }).catch(that.onError);
              }, 1000);
            });
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
    const {loading, modalLoading, errMsg, sucMsg, isWithdrawing, withdrawAvailable, user = MockUserApi.createMockUser()} = this.state;
    const {nickname, account} = user;
    const {balance} = account;

    const atModalContent = `总计￥${balance}`;

    let errMsgModal = (
      <AtModal isOpened
               closeOnClickOverlay={false}>
        <AtModalHeader>出错了</AtModalHeader>
        <AtModalContent>
          <Text>{errMsg}</Text>
        </AtModalContent>
        <AtModalAction>
          <Button onClick={this.handleCancel}>确定</Button>
        </AtModalAction>
      </AtModal>
    );

    let loadingModal = (
      <AtModal isOpened
               closeOnClickOverlay={false}>
        <AtModalHeader>提现确认</AtModalHeader>
        <AtModalContent>
          <View style={{position: 'relative', height: '100px'}}>
            <AtActivityIndicator content='加载中...' size={32} mode="center"/>
          </View>
        </AtModalContent>
      </AtModal>
    );

    let sucMsgModal = (
      <AtModal isOpened
               closeOnClickOverlay={false}>
        <AtModalHeader>提现确认</AtModalHeader>
        <AtModalContent>
          <Text>{sucMsg}</Text>
        </AtModalContent>
      </AtModal>
    );

    let buyModal = (
      <AtModal isOpened
               closeOnClickOverlay={false}>
        <AtModalHeader>提现确认</AtModalHeader>
        <AtModalContent>
          <Text decode>${atModalContent}</Text>
        </AtModalContent>
        <AtModalAction>
          <Button onClick={this.handleCancel}>取消</Button>
          <Button onClick={this.handleConfirm}>确定</Button>
        </AtModalAction>
      </AtModal>
    );

    return (loading || (!isWithdrawing && errMsg)
      ? (
        <LoadingPage errMsg={errMsg}/>
      )
      : (
        <View>

          {
            isWithdrawing
              ? ( errMsg ? errMsgModal
                : ( sucMsg ? sucMsgModal
                    : ( modalLoading ? (loadingModal) : (buyModal))
                )
              )
              : null
          }

          <AtCard
            note='每天只能提现一次哦'
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
                          onClick={() => this.setState({isWithdrawing: true})}>
                  全部提现
                </AtButton>
              )
              : null
          }

        </View>
      )
    );
  }

  private onError = createSimpleErrorHandler('PlatformAccount', this);
}
