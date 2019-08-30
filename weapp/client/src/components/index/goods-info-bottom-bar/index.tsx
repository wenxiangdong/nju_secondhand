import Taro, {Component} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {GoodsWithSellerVO, MockGoodsApi, PurchaseResult} from "../../../apis/GoodsApi";
import urlList, {chatUrlConfig, resultUrlConfig} from "../../../utils/url-list";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import WhiteSpace from "../../common/white-space";
import {AtButton} from "taro-ui";
import {CSSProperties} from "react";

import "taro-ui/dist/style/components/flex.scss";
import "taro-ui/dist/style/components/modal.scss";
import {apiHub} from "../../../apis/ApiHub";
import ConfirmModal from "../../common/confirm-modal";
import {relaunchTimeout} from "../../../utils/date-util";

import "@tarojs/async-await";
import {MessageVO} from "../../../apis/MessageApi";

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

  private readonly defaultBuyingState = {
    isBuying: false,
    buyingLoading: false,
    errMsg: '',
    sucMsg: ''
  };

  constructor(props) {
    super(props);
    this.state = {
      isBuying: false,
      buyingLoading: false
    };
  }

  private handleChat = () => {
    // 预设一个 商品信息 的消息
    const {goodsWithSeller} = this.props;
    const {goods, seller} = goodsWithSeller;
    const message: MessageVO = {
      receiverID: seller._id,
      content: `text://物品名称：${goods.name},物品价格：￥${goods.price}，物品描述：${goods.desc}`
    };
    chatUrlConfig.setPreMessage(message);
    Taro.navigateTo({
      url: chatUrlConfig.createUrl(this.props.goodsWithSeller.seller._id)
    }).catch(this.onError);
    // Taro.navigateTo({
    //   url: chatUrlConfig.createUrl(this.props.goodsWithSeller.seller._id)
    // }).catch(this.onError);
  };

  private handleBuy = () => {
    this.setState({...this.defaultBuyingState, isBuying: true});
  };

  private handleCancel = () => {
    this.setState({...this.defaultBuyingState});
  };

  private handleConfirm = async () => {
    this.setState({buyingLoading: true});
    let res: PurchaseResult | undefined = undefined;
    try {
      res = await apiHub.goodsApi.purchase(this.props.goodsWithSeller.goods._id);
    } catch (error) {
      this.onError(error);
    }
    // 购买失败
    if (!res) {
      return;
    }
    let payResult: 0 | -1 = 0;
    try {
      await Taro.requestPayment({
        nonceStr: res.nonceStr,
        signType: res.signType,
        timeStamp: res.timeStamp,
        paySign: res.paySign,
        package: res.package
      });
    } catch (error) {
      console.error(error);
      payResult = -1;
      this.onError(new Error("支付失败"));
    }
    apiHub.orderApi.orderCallback(res.orderID, payResult)
      .then(() => {
        console.log("订单回调成功")
      })
      .catch(() => {
        console.log("订单回调失败");
      });
    // 支付失败
    if (payResult === -1) {
      return;
    }
    resultUrlConfig.go({
      title: "购买成功",
      status: "success",
      tip: "去【我买过的】看看",
      link: urlList.MY_BOUGHT
    });
    // this.setState({buyingLoading: true}, function() {
    //   apiHub.goodsApi.purchase(that.props.goodsWithSeller.goods._id)
    //     .then((res: PurchaseResult) => {
    //       return Taro.requestPayment({
    //         nonceStr: res.nonceStr,
    //         signType: res.signType,
    //         timeStamp: res.timeStamp,
    //         paySign: res.paySign,
    //         package: res.package
    //       });
    //       // const sucMsg = '购买完成';
    //       // that.setState({sucMsg, buyingLoading: false}, function() {
    //       //   setTimeout(function() {
    //       //     Taro.reLaunch({
    //       //       url: urlList.INDEX
    //       //     }).catch(that.onError);
    //       //   },  relaunchTimeout);
    //       // });
    //     })
    //     .then(res => {

    //     })
    //     .catch(that.onError);
    // });
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
