import Taro, {Component} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {GoodsWithSellerVO, MockGoodsApi} from "../../../apis/GoodsApi";
import urlList, {chatUrlConfig} from "../../../utils/url-list";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import WhiteSpace from "../../common/white-space";
import {AtButton} from "taro-ui";
import {CSSProperties} from "react";

import "taro-ui/dist/style/components/flex.scss";
import "taro-ui/dist/style/components/modal.scss";
import {apiHub} from "../../../apis/ApiHub";
import ConfirmModal from "../../common/confirm-modal";

interface IProp {
  goodsWithSeller: GoodsWithSellerVO
}

interface IState {
  isBuying: boolean,
  buyingLoading: boolean,
  errMsg?: string,
  sucMsg?: string,
}

/**
 * GoodsInfoBottomBar
 * @author 张李承
 * @create 2019/8/4 14:20
 */
export default class GoodsInfoBottomBar extends Component<IProp, IState> {

  static defaultProps: IProp = {goodsWithSeller: MockGoodsApi.createMockGoodsWithSeller()};

  constructor(props) {
    super(props);
    this.state = {
      isBuying: false,
      buyingLoading: false
    };
  }

  private handleChat = () => {
    Taro.navigateTo({
      url: chatUrlConfig.createUrl(this.props.goodsWithSeller.seller._id)
    }).catch(this.onError);
  };

  private handleBuy = () => {
    this.setState({isBuying: true, buyingLoading: false, errMsg: undefined, sucMsg: undefined});
  };

  private handleCancel = () => {
    this.setState({isBuying: false, buyingLoading: false, errMsg: undefined, sucMsg: undefined});
  };

  private handleConfirm = () => {
    const that = this;
    this.setState({buyingLoading: true}, function() {
      apiHub.goodsApi.purchase(that.props.goodsWithSeller.goods._id)
        .then(function() {
          const sucMsg = '购买完成';
          that.setState({sucMsg, buyingLoading: false}, function() {
            setTimeout(function() {
              Taro.reLaunch({
                url: urlList.INDEX
              }).catch(that.onError);
            }, 2000);
          });
        })
        .catch(that.onError);
    });
  };

  render() {
    const {atButtonStyle, bottomBarStyle} = GoodsInfoBottomBar.createStyles();
    const {isBuying, buyingLoading, errMsg, sucMsg} = this.state;
    const {name, price} = this.props.goodsWithSeller.goods;

    const atModalContent = `${name}\n￥${price}`;

    return (
      <View>
        <WhiteSpace height={50}/>

        {
          isBuying
            ? (
              <ConfirmModal loading={buyingLoading}
                            onCancel={this.handleCancel}
                            onConfirm={this.handleConfirm}
                            errMsg={errMsg}
                            sucMsg={sucMsg}
                            title="购买确认"
                            content={atModalContent}/>
            )
            : null
          }

        <View className='at-row' style={bottomBarStyle}>
          <View className='at-col at-col__offset-1 at-col-4'>
            <AtButton circle type='secondary' customStyle={atButtonStyle} onClick={this.handleBuy}>马上买</AtButton>
          </View>
          <View className='at-col at-col__offset-2 at-col-4'>
            <AtButton circle type='primary' customStyle={atButtonStyle} onClick={this.handleChat}>聊一聊</AtButton>
          </View>
        </View>
      </View>
    )
  }

  private static createStyles() {
    const atButtonStyle:CSSProperties = {
      height: '30px',
      lineHeight: '30px'
    };

    const bottomBarStyle:CSSProperties = {
      height: '40px',
      paddingTop: '10px',
      backgroundColor: 'white',
      zIndex: 200,
      position: 'fixed',
      left: '0',
      bottom: '0'
    };

    return {
      atButtonStyle,
      bottomBarStyle
    };
  }

  private onError = createSimpleErrorHandler('GoodsInfoBottomBar', this);
}
