import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import urlList from "../../../utils/url-list";
import {relaunchTimeout} from "../../../utils/date-util";
import localConfig from "../../../utils/local-config";
import {apiHub} from "../../../apis/ApiHub";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import {Location, MockUserApi, UserDTO, UserVO} from "../../../apis/UserApi";
import LoadingPage from "../../../components/common/loading-page";
import ConfirmModal from "../../../components/common/confirm-modal";
import {CSSProperties} from "react";
import {AtButton, AtForm, AtInput} from "taro-ui";
import WechatUserInfoBar from "../../../components/common/wechat-user-info-bar";
import WhiteSpace from "../../../components/common/white-space";
import DLocation from "../../../components/common/d-location/DLocation";
import DUserInfoBar from "../../../components/common/d-user-info-bar";

function createStyles() {
  const rootViewStyle: CSSProperties = {
    padding: '1vw 2vw',
    margin: '1vw 2vw',
    width: '92vw',
    display: 'flex',
    flexDirection: "column",
    alignItems: 'center'
  };

  const inputStyle: CSSProperties = {
    width: '90vw'
  };

  const buttonViewStyle: CSSProperties = {
    position: 'fixed',
    bottom: 0,
    width: '100vw',
    zIndex: 9,
    left: 0
  };

  const locationStyle: CSSProperties = {
    width: '90vw',
    height: '90vw',
    marginLeft: '2vw'
  };

  return {rootViewStyle, inputStyle, buttonViewStyle, locationStyle};
}

const styles = createStyles();

interface IState {
  loading: boolean,
  errMsg?: string,
  sucMsg?: string,
  user: UserVO,
  modifyInfo: UserDTO,
  isModifying: boolean,
  modifyLoading: boolean
}

/**
 * index
 * @author 张李承
 * @create 2019/8/11 23:18
 */
export default class index extends Component<any, IState> {

  private readonly NOT_FIND_USER_ID_ERROR:Error = new Error('登录已失效');

  private userId:string;

  private readonly defaultModifyState = {
    isModifying: false,
    modifyLoading: false,
    errMsg: undefined,
    sucMsg: undefined,
  };

  config: Config = {
    navigationBarTitleText: '用户信息'
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      user: MockUserApi.createMockUser(),
      modifyInfo: MockUserApi.createMockUserDTO(),
      isModifying: false,
      modifyLoading: false
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

  private onNotLogin = () => {
    this.onError(this.NOT_FIND_USER_ID_ERROR);
    setTimeout(() => {
      Taro.reLaunch({
        url: urlList.LOGIN
      })
        .catch(this.onError);
    }, relaunchTimeout);
  };

  private onReset = () => {
    this.setState({modifyInfo: MockUserApi.createMockUserDTO()});
  };

  private onSubmit = () => {
    this.setState({...this.defaultModifyState, isModifying: true});
  };

  private handleCancel = () => {
    this.setState({...this.defaultModifyState});
  };

  private handleConfirm = () => {
    const that = this;
    this.setState({modifyLoading: true}, function() {
      const {modifyInfo} = that.state;
      if (modifyInfo) {
        apiHub.userApi.modifyInfo(modifyInfo)
          .then(function () {
            const sucMsg = '信息修改完成';
            that.setState({sucMsg, modifyLoading: false}, function () {
              setTimeout(function () {
                Taro.reLaunch({
                  url: urlList.MY
                }).catch(that.onError);
              },  relaunchTimeout);
            });
          })
          .catch(that.onError);
      } else {
        that.onNotLogin();
      }
    });
  };

  private handleEmailChange = (email) => {
    const modifyInfo = {
      ...this.state.modifyInfo,
      email
    };
    this.setState({modifyInfo});
    return email
  };

  private handlePhoneChange = (phone) => {
    const modifyInfo = {
      ...this.state.modifyInfo,
      phone
    };
    this.setState({modifyInfo});
    return phone
  };

  private validModify = () => {
    const {email, phone, address} = this.state.modifyInfo;
    return email || phone || address.name;
  };

  render() {
    const {
      loading, errMsg,
      sucMsg, isModifying, modifyLoading,
      user, modifyInfo
    } = this.state;

    const {avatar, nickname, address, email, phone} = user;

    let location: Location = modifyInfo.address.name? modifyInfo.address: address;

    return (loading || (!isModifying && errMsg))
      ? (
        <LoadingPage errMsg={errMsg}/>
      )
      : (
      <View style={styles.rootViewStyle}>

        {
          isModifying
            ? (
              <ConfirmModal loading={modifyLoading}
                            onCancel={this.handleCancel}
                            onConfirm={this.handleConfirm}
                            errMsg={errMsg}
                            sucMsg={sucMsg}
                            title="修改信息"
                            content={'信息修改中'}/>
            )
            : null
        }

        <WechatUserInfoBar/>
        <DUserInfoBar avatar={avatar} nickname={nickname}/>
        {/*TODO*/}

        <AtForm
          onSubmit={this.onSubmit}
          onReset={this.onReset}
        >

          <AtInput
            customStyle={styles.inputStyle}
            name='value'
            title='邮件'
            type='email'
            placeholder={email}
            value={modifyInfo.email}
            onChange={this.handleEmailChange}
          />

          <AtInput
            customStyle={styles.inputStyle}
            name='value'
            title='电话'
            type='phone'
            placeholder={phone}
            value={modifyInfo.phone}
            onChange={this.handlePhoneChange}
          />

          <DLocation location={location} style={styles.locationStyle}/>

          <AtButton type='primary'>选择地点</AtButton>
          {/*TODO*/}

          <WhiteSpace height={80}/>
          <View style={styles.buttonViewStyle}>
            <AtButton type='primary' formType='submit' disabled={!this.validModify()}>提交反馈</AtButton>
            <AtButton type='secondary' formType='reset'>重置反馈</AtButton>
          </View>
        </AtForm>

      </View>
    )
  }

  private onError = createSimpleErrorHandler('userInfo', this);
}
