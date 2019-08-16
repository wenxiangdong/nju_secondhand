import Taro, {Component} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {AtButton} from "taro-ui";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import {CSSProperties} from "react";
import ConfirmModal from "../confirm-modal";

function createStyles() {
  const buttonStyle: CSSProperties = {
    width: '80vw',
    height: '30px',
    lineHeight: '30px',
    margin: '1vw 0'
  };

  return {buttonStyle};
}

export const styles = createStyles();

interface IProp {
  onGetLocation: (location) => void
}

interface IState {
  isChoosingLocation: boolean,
  chooseLoading: boolean,
  errMsg?: string,
}

/**
 * DChooseLocation
 * @author 张李承
 * @create 2019/8/16 23:24
 */
export default class DChooseLocation extends Component<IProp, IState> {

  static defaultProps: IProp = {
    onGetLocation: () => {}
  };

  constructor(props) {
    super(props);
    this.state = {
      isChoosingLocation: false,
      chooseLoading: false,
    };
  }

  private onChooseLocation = () => {
    this.setState({isChoosingLocation: true, chooseLoading: true});
    const chooseLocation = () => {
      Taro.chooseLocation()
        .then(location => {
          this.props.onGetLocation(location);
          this.setState({isChoosingLocation: false, chooseLoading: false});
        })
        .catch((e) => {
          if (e.errMsg !== 'chooseLocation:fail cancel'){
            this.onError(e);
          } else {
            this.setState({isChoosingLocation: false, chooseLoading: false});
          }
        });
    };
    const userLocationSetting = 'scope.userLocation';
    Taro.getSetting()
      .then(res => {
        if (!res.authSetting[userLocationSetting]) {
          this.setState({chooseLoading: false});
        } else {
          chooseLocation();
        }
      })
      .catch(this.onError);
  };

  private handleCancel = () => {
    this.setState({isChoosingLocation: false, chooseLoading: false, errMsg: undefined});
  };

  private handleConfirm = () => {
    Taro.openSetting()
      .then(() => {
        this.setState({isChoosingLocation: false, chooseLoading: false});
      })
      .catch(this.onError);
  };

  render() {
    const {isChoosingLocation, chooseLoading, errMsg} = this.state;
    return (
      <View>

        {
          isChoosingLocation
            ? (
              <ConfirmModal loading={chooseLoading}
                            onCancel={this.handleCancel}
                            onConfirm={this.handleConfirm}
                            errMsg={errMsg}
                            title="地址授权中"
                            content={'请提供您的位置信息\n信息将被用于您发布的商品的参考信息'}/>
            )
            : null
        }

        <AtButton type='primary' customStyle={styles.buttonStyle}
                  onClick={this.onChooseLocation}>
          请选择地点
        </AtButton>
      </View>
    )
  }

  private onError = createSimpleErrorHandler('DChooseLocation', this);
}
