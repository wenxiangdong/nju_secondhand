import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {Location, MockUserApi, UserDTO} from "../../apis/UserApi";
import {apiHub} from "../../apis/ApiHub";
import urlList from "../../utils/url-list";
import {relaunchTimeout} from "../../utils/date-util";
import {createSimpleErrorHandler} from "../../utils/function-factory";
import ConfirmModal from "../../components/common/confirm-modal";
import WechatUserInfoBar from "../../components/common/wechat-user-info-bar";
import {AtButton, AtForm, AtInput} from "taro-ui";
import WhiteSpace from "../../components/common/white-space";
import {isInvalidEmail, isInvalidPhone} from "../../utils/valid-util";
import {CSSProperties} from "react";
import localConfig from "../../utils/local-config";
import DChooseLocation from "../../components/common/d-choose-location/DChooseLocation";
import AddressShowBar from "../../components/common/address-show-bar";

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

export const styles = createStyles();

interface IState {
  errMsg?: string,
  sucMsg?: string,
  registerInfo: UserDTO,
  isRegistering: boolean,
  registerLoading: boolean,
  invalidEmail: boolean,
  invalidPhone: boolean,
}

/**
 * index
 * @author 张李承
 * @create 2019/8/14 22:09
 */
export default class index extends Component<any, IState> {

  private readonly GET_USER_INFO_FAIL:Error = new Error('获取注册信息失败\n请稍后重试');
  private readonly INVALID_MODIFY_INFO:Error = new Error('修改信息非法\n请检查');

  private readonly defaultRegisterState = {
    isRegistering: false,
    registerLoading: false,
    errMsg: '',
    sucMsg: '',
  };

  config: Config = {
    navigationBarTitleText: '注册'
  };

  constructor(props) {
    super(props);
    this.state = {
      registerInfo: MockUserApi.createMockUserDTO(),
      isRegistering: false,
      registerLoading: false,
      invalidEmail: false,
      invalidPhone: false,
    };
  }

  private onReset = () => {
    this.setState({registerInfo: MockUserApi.createMockUserDTO(), invalidPhone: false, invalidEmail: false});
  };

  private onSubmit = () => {
    this.setState({...this.defaultRegisterState, isRegistering: true});
  };

  private handleCancel = () => {
    this.setState({...this.defaultRegisterState});
  };

  private handleConfirm = () => {
    const that = this;
    if (this.validRegister()) {
      this.setState({registerLoading: true}, function () {
        apiHub.userApi.signUp(that.state.registerInfo)
          .then(function () {
            const sucMsg = '注册成功';
            apiHub.userApi.login()
              .then(function(user) {
                if (user && user._id) {
                  localConfig.setUserId(user._id);
                  that.setState({sucMsg, registerLoading: false});
                  setTimeout(function () {
                    Taro.reLaunch({
                      url: urlList.INDEX
                    }).catch(that.onError);
                  }, relaunchTimeout);
                } else {
                  throw that.GET_USER_INFO_FAIL
                }
              })
              .catch(that.onError);

          })
          .catch(that.onError);
      });
    } else {
      that.onError(that.INVALID_MODIFY_INFO);
    }
  };

  private handleEmailChange = (email) => {
    const registerInfo = {
      ...this.state.registerInfo,
      email
    };
    this.setState({registerInfo});
    return email
  };

  private checkEmailValid = () => {
    const {email} = this.state.registerInfo;
    let invalidEmail = !!(email && isInvalidEmail(email));
    this.setState({invalidEmail});
  };

  private handlePhoneChange = (phone) => {
    const registerInfo = {
      ...this.state.registerInfo,
      phone
    };
    this.setState({registerInfo});
    return phone
  };

  private checkPhoneValid = () => {
    const {phone} = this.state.registerInfo;
    let invalidPhone = !!(phone && isInvalidPhone(phone));
    this.setState({invalidPhone});
  };

  private setRegisterUserInfo = (result) => {
    if (result && result.detail) {
      const {errMsg, rawData} = result.detail;
      if (errMsg === 'getUserInfo:ok') {
        try {
          const data = JSON.parse(rawData);
          const {nickName, avatarUrl} = data;
          const registerInfo:UserDTO = {
            ...this.state.registerInfo,
            nickname: nickName,
            avatar: avatarUrl
          };
          this.setState({registerInfo})
        } catch (e) {
          this.onError(e);
        }
      } else {
        console.error(errMsg);
      }
    }
  };

  private onGetLocation = (location) => {
    const errMsg = location['errMsg'];
    if (errMsg === 'chooseLocation:ok') {
      let address: Location = {
        name: location.name,
        longitude: location.longitude,
        latitude: location.latitude,
        address: location.address
      };
      const registerInfo:UserDTO = {
        ...this.state.registerInfo,
        address
      };
      this.setState({registerInfo});
    } else {
      this.onError(new Error(errMsg));
    }
  };

  private validRegister = () => {
    const {invalidEmail, invalidPhone} = this.state;
    const {avatar, nickname, email, phone, address} = this.state.registerInfo;
    return (avatar && nickname && email && phone && address.name)
      && (!(invalidEmail || invalidPhone));
  };

  render() {
    const {
      isRegistering, registerLoading,
      registerInfo,
      invalidEmail, invalidPhone,
      errMsg, sucMsg,
    } = this.state;

    return (
      <View style={styles.rootViewStyle}>

        {
          isRegistering
            ? (
              <ConfirmModal loading={registerLoading}
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
          registerInfo.avatar
            ? <WechatUserInfoBar/>
            : (
              <AtButton openType='getUserInfo'
                        customStyle={styles.buttonStyle}
                        onGetUserInfo={this.setRegisterUserInfo}>
                请授权头像昵称
              </AtButton>
            )
        }

        <AtForm
          onSubmit={this.onSubmit}
          onReset={this.onReset}
        >

          <AtInput
            customStyle={styles.inputStyle}
            name='value'
            title='邮件'
            type='email'
            placeholder={'请使用学校邮箱'}
            value={registerInfo.email}
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
            placeholder={'请输入您的电话'}
            value={registerInfo.phone}
            onChange={this.handlePhoneChange}
            onBlur={this.checkPhoneValid}
            error={invalidPhone}
            clear
          />

          <View style={styles.buttonViewStyle}>
            <AtButton type='primary' formType='submit' disabled={!this.validRegister()}>提交注册</AtButton>
            <AtButton type='secondary' formType='reset'>重置信息</AtButton>
          </View>
        </AtForm>

        <DChooseLocation onGetLocation={this.onGetLocation}/>
        {
          registerInfo.address.name && !isRegistering
            ? <AddressShowBar address={registerInfo.address}/>
            : null
        }

        <WhiteSpace height={80}/>

      </View>
    )
  }

  private onError = createSimpleErrorHandler('userInfo', this);
}
