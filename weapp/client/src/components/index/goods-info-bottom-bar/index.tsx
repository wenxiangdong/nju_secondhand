import Taro, {Component} from '@tarojs/taro'
import {Button, View, Text} from '@tarojs/components'
import {GoodsWithSellerVO, MockGoodsApi} from "../../../apis/GoodsApi";
import urlList, {chatUrlConfig} from "../../../utils/url-list";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import WhiteSpace from "../../common/white-space";
import {AtActivityIndicator, AtButton, AtModal, AtModalAction, AtModalContent, AtModalHeader} from "taro-ui";
import {CSSProperties} from "react";

import "taro-ui/dist/style/components/flex.scss";
import "taro-ui/dist/style/components/modal.scss";
import {apiHub} from "../../../apis/ApiHub";
import {MessageVO} from "../../../apis/MessageApi";

interface IProp {
  goodsWithSeller: GoodsWithSellerVO
}

interface IState {
  isBuying: boolean,
  isLoading: boolean,
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
      isLoading: false
    };
  }

  private chat = () => {
    // 预设一个 商品信息 的消息
    const {goodsWithSeller} = this.props;
    const {goods} = goodsWithSeller;
    const message: MessageVO = {
      receiverID: goods._id,
      content: `text://物品名称：${goods.name},物品价格：￥${goods.price}，物品描述：${goods.desc}`
    };
    chatUrlConfig.setPreMessage(message);
    Taro.navigateTo({
      url: chatUrlConfig.createUrl(this.props.goodsWithSeller.seller._id)
    }).catch(this.onError);
  };

  private handleCancel = () => {
    this.setState({isBuying: false});
  };

  private handleConfirm = () => {
    const that = this;
    this.setState({isLoading: true}, function() {
      apiHub.goodsApi.purchase(that.props.goodsWithSeller.goods._id)
        .then(function() {
          const sucMsg = '购买完成';
          that.setState({sucMsg}, function() {
            setTimeout(function() {
              Taro.reLaunch({
                url: urlList.INDEX
              }).catch(that.onError);
            }, 1000);
          });
        })
        .catch(that.onError);
    });
  };

  render() {
    const {atButtonStyle, bottomBarStyle} = GoodsInfoBottomBar.createStyles();
    const {isBuying, isLoading, errMsg, sucMsg} = this.state;
    const {name, price} = this.props.goodsWithSeller.goods;

    const atModalContent = `${name}\n￥${price}`;

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
        <AtModalHeader>购买确认</AtModalHeader>
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
        <AtModalHeader>购买确认</AtModalHeader>
        <AtModalContent>
          <Text>{sucMsg}</Text>
        </AtModalContent>
      </AtModal>
    );

    let buyModal = (
      <AtModal isOpened
               closeOnClickOverlay={false}>
        <AtModalHeader>购买确认</AtModalHeader>
        <AtModalContent>
          <Text decode>${atModalContent}</Text>
        </AtModalContent>
        <AtModalAction>
          <Button onClick={this.handleCancel}>取消</Button>
          <Button onClick={this.handleConfirm}>确定</Button>
        </AtModalAction>
      </AtModal>
    );

    return (
      <View>
        <WhiteSpace height={50}/>

        {
          isBuying
            ? ( errMsg ? errMsgModal
              : ( sucMsg ? sucMsgModal
                : ( isLoading ? (loadingModal) : (buyModal))
              )
            )
            : null
          }

        <View className='at-row' style={bottomBarStyle}>
          <View className='at-col at-col__offset-1 at-col-4'>
            <AtButton circle type='secondary' customStyle={atButtonStyle} onClick={() => this.setState({isBuying: true})}>马上买</AtButton>
          </View>
          <View className='at-col at-col__offset-2 at-col-4'>
            <AtButton circle type='primary' customStyle={atButtonStyle} onClick={this.chat}>聊一聊</AtButton>
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
