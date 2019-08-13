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
import {isInvalidEmail, isInvalidPhone} from "../../../utils/valid-util";

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

  const buttonStyle: CSSProperties = {
    width: '80vw',
    height: '30px',
    lineHeight: '30px',
    margin: '1vw 0'
  };

  return {rootViewStyle, inputStyle, buttonViewStyle, locationStyle, buttonStyle};
}

const styles = createStyles();

interface IState {
  loading: boolean,
  errMsg?: string,
  sucMsg?: string,
  user: UserVO,
  modifyInfo: UserDTO,
  isModifying: boolean,
  modifyLoading: boolean,
  invalidEmail: boolean,
  invalidPhone: boolean,
}

/**
 * index
 * @author 张李承
 * @create 2019/8/11 23:18
 */
export default class index extends Component<any, IState> {

  private readonly NOT_FIND_USER_ID_ERROR:Error = new Error('登录已失效');
  private readonly INVALID_MODIFY_INFO:Error = new Error('修改信息非法\n请检查');

  private userId:string;

  private readonly defaultModifyState = {
    isModifying: false,
    modifyLoading: false,
    errMsg: '',
    sucMsg: '',
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
      modifyLoading: false,
      invalidEmail: false,
      invalidPhone: false,
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
    this.setState({modifyInfo: MockUserApi.createMockUserDTO(), invalidPhone: false, invalidEmail: false});
  };

  private onSubmit = () => {
    this.setState({...this.defaultModifyState, isModifying: true});
  };

  private handleCancel = () => {
    this.setState({...this.defaultModifyState});
  };

  private handleConfirm = () => {
    const that = this;
    if (this.validModify()) {
      this.setState({modifyLoading: true}, function () {
        const {avatar, nickname, address, email, phone} = that.state.user;
        const {modifyInfo} = that.state;
        let userDTO: UserDTO = {
          address: modifyInfo.address.name ? modifyInfo.address : address,
          nickname: modifyInfo.nickname ? modifyInfo.nickname : nickname,
          avatar: modifyInfo.avatar ? modifyInfo.avatar : avatar,
          phone: modifyInfo.phone ? modifyInfo.phone : phone,
          email: modifyInfo.email ? modifyInfo.email : email
        };
        apiHub.userApi.modifyInfo(userDTO)
          .then(function () {
            const sucMsg = '信息修改完成';
            that.setState({sucMsg, modifyLoading: false}, function () {
              setTimeout(function () {
                Taro.reLaunch({
                  url: urlList.MY
                }).catch(that.onError);
              }, relaunchTimeout);
            });
          })
          .catch(that.onError);
      });
    } else {
      that.onError(that.INVALID_MODIFY_INFO);
    }
  };

  private handleEmailChange = (email) => {
    const modifyInfo = {
      ...this.state.modifyInfo,
      email
    };
    this.setState({modifyInfo});
    return email
  };

  private checkEmailValid = () => {
    const {email} = this.state.modifyInfo;
    let invalidEmail = !!(email && isInvalidEmail(email));
    this.setState({invalidEmail});
  };

  private handlePhoneChange = (phone) => {
    const modifyInfo = {
      ...this.state.modifyInfo,
      phone
    };
    this.setState({modifyInfo});
    return phone
  };

  private checkPhoneValid = () => {
    const {phone} = this.state.modifyInfo;
    let invalidPhone = !!(phone && isInvalidPhone(phone));
    this.setState({invalidPhone});
  };

  private setModifyUserInfo = (result) => {
    if (result && result.detail) {
      const {errMsg, rawData} = result.detail;
      if (errMsg === 'getUserInfo:ok') {
        try {
          const data = JSON.parse(rawData);
          const {nickName, avatarUrl} = data;
          const modifyInfo:UserDTO = {
            ...this.state.modifyInfo,
            nickname: nickName,
            avatar: avatarUrl
          };
          this.setState({modifyInfo})
        } catch (e) {
          this.onError(e);
        }
      } else {
        console.error(errMsg);
      }
    }
  };

  private onChooseLocation = () => {
    Taro.chooseLocation()
      .then(location => {
        console.log(location);
        const errMsg = location['errMsg'];
        if (errMsg === 'chooseLocation:ok') {
          let address: Location = {
            name: location.name,
            longitude: location.longitude,
            latitude: location.latitude,
            address: location.address
          };
          const modifyInfo:UserDTO = {
            ...this.state.modifyInfo,
            address
          };
          this.setState({modifyInfo});
        } else {
          this.onError(new Error(errMsg));
        }
      })
      .catch((e) => {
        if (e.errMsg !== 'chooseLocation:fail cancel')
          this.onError(e);
      });
  };

  private validModify = () => {
    const {invalidEmail, invalidPhone} = this.state;
    const {avatar, nickname, email, phone, address} = this.state.modifyInfo;
    return (avatar || nickname || email || phone || address.name)
      && (!(invalidEmail || invalidPhone));
  };

  render() {
    const {
      loading, errMsg,
      sucMsg, isModifying, modifyLoading,
      user, modifyInfo,
      invalidEmail, invalidPhone
    } = this.state;

    const {avatar, nickname, address, email, phone} = user;

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
                            content={'确认修改前\n请确认提交的信息是否正确'}/>
            )
            : null
        }

        {
          modifyInfo.avatar
            ? <WechatUserInfoBar/>
            : <DUserInfoBar avatar={avatar} nickname={nickname}/>
        }
        <AtButton type='primary' openType='getUserInfo'
                  customStyle={styles.buttonStyle}
                  onGetUserInfo={this.setModifyUserInfo}>
          授权头像昵称
        </AtButton>

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
            onBlur={this.checkEmailValid}
            error={invalidEmail}
            clear
          />

          <AtInput
            customStyle={styles.inputStyle}
            name='value'
            title='电话'
            type='phone'
            placeholder={phone}
            value={modifyInfo.phone}
            onChange={this.handlePhoneChange}
            onBlur={this.checkPhoneValid}
            error={invalidPhone}
            clear
          />

          <View style={styles.buttonViewStyle}>
            <AtButton type='primary' formType='submit' disabled={!this.validModify()}>提交反馈</AtButton>
            <AtButton type='secondary' formType='reset'>重置反馈</AtButton>
          </View>
        </AtForm>

        <AtButton type='primary' customStyle={styles.buttonStyle}
                  onClick={this.onChooseLocation}>
          选择地点
        </AtButton>

        {
          modifyInfo.address.name
            ? <DLocation location={modifyInfo.address} style={styles.locationStyle}/>
            : <DLocation location={address} style={styles.locationStyle}/>
        }

        <WhiteSpace height={80}/>

      </View>
    )
  }

  private onError = createSimpleErrorHandler('userInfo', this);
}
