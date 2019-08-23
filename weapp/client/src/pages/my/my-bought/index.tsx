import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {OrderVO} from "../../../apis/OrderApi";
import {apiHub} from "../../../apis/ApiHub";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import LoadingPage from "../../../components/common/loading-page";
import ConfirmModal from "../../../components/common/confirm-modal";
import {AtLoadMore, AtTabs, AtTabsPane} from "taro-ui";
import WhiteSpace from "../../../components/common/white-space";
import BoughtOrderCard from "../../../components/my/bought-order-card";
import {StyleHelper} from "../../../styles/style-helper";

import '../../../styles/tab-title-fixed.scss';
import {relaunchTimeout} from "../../../utils/date-util";

interface IState {
  loading: boolean,
  isAccept: boolean,
  acceptLoading: boolean,
  errMsg?: string,
  sucMsg?: string,
  acceptIdx: number,
  atModalContent: string,
  ongoingOrders: Array<OrderVO>,
  ongoingOrdersLoadMoreStatus?: 'more' | 'loading' | 'noMore',
  historyOrders: Array<OrderVO>,
  historyOrdersLoadMoreStatus?: 'more' | 'loading' | 'noMore',
  currentTabIndex: number
}

/**
 * 我买到的
 * @author 张李承
 * @create 2019/8/11 11:57
 */
export default class index extends Component<any, IState> {

  config: Config = {
    navigationBarTitleText: '我买到的'
  };

  private readonly defaultAtModalContent = '出错了，请取消操作';

  private readonly defaultAcceptState = {
    isAccept: false,
    acceptLoading: false,
    errMsg: '',
    sucMsg: '',
    acceptIdx: -1,
    atModalContent: this.defaultAtModalContent,
  };

  private cancelTimeout;

  private readonly tabList = [{ title: '待送达' }, { title: '历史订单' }];

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      isAccept: false,
      acceptLoading: false,
      acceptIdx: -1,
      atModalContent: this.defaultAtModalContent,
      ongoingOrders: [],
      historyOrders: [],
      currentTabIndex: 0,
    };
  }

  componentWillMount() {
    Promise.all([
      apiHub.orderApi.getSellerOngoingOrders(0, 10),
      apiHub.orderApi.getSellerHistoryOrders(0, 10)
    ])
      .then(([ongoingOrders, historyOrders]) => {
        this.setState({
          ongoingOrders, historyOrders,
          ongoingOrdersLoadMoreStatus: ongoingOrders.length? 'more': 'noMore',
          historyOrdersLoadMoreStatus: historyOrders.length? 'more': 'noMore',
          loading: false
        });
      })
      .catch(this.onError);
  }

  private onAcceptOrder = (acceptIdx: number) => {
    const order = this.state.ongoingOrders[acceptIdx];
    const atModalContent = `确认收货吗\n商品名：${order.goodsName}\n此操作无法撤销`;
    this.setState({...this.defaultAcceptState, isAccept: true, acceptIdx, atModalContent})
  };

  private handleCancel = () => {
    this.setState({...this.defaultAcceptState});
    clearTimeout(this.cancelTimeout);
  };

  private handleConfirm = () => {
    const {acceptIdx} = this.state;
    const order = this.state.ongoingOrders[this.state.acceptIdx];
    const {_id} = order;
    const that = this;
    this.setState({acceptLoading: true}, function () {
      apiHub.orderApi.accept(_id)
        .then(function() {
          console.log('accept success', _id);
          const orderArr = that.state.ongoingOrders;
          const sucMsg = `商品名：${order.goodsName}\n已收货成功`;
          that.setState({sucMsg, acceptLoading: false, ongoingOrders: orderArr.slice(0, acceptIdx).concat(orderArr.slice(acceptIdx + 1))}, function() {
            that.cancelTimeout = setTimeout(() => that.setState({...that.defaultAcceptState}),  relaunchTimeout);
          });
        })
        .catch(that.onError)
      ;
    });
  };

  private onLoadMoreOngoingOrders = () => {
    this.setState({ongoingOrdersLoadMoreStatus: 'loading'},
      this.loadMoreOngoingOrders);
  };

  private loadMoreOngoingOrders = () => {
    const lastIndex = this.state.ongoingOrders.length;
    apiHub.orderApi.getSellerOngoingOrders(lastIndex)
      .then((ongoingOrders) => {
        if (ongoingOrders && ongoingOrders.length) {
          this.setState({ongoingOrders: this.state.ongoingOrders.concat(ongoingOrders), ongoingOrdersLoadMoreStatus: 'more'});
        } else {
          this.setState({ongoingOrdersLoadMoreStatus: 'noMore'});
        }
      })
      .catch(this.onError);
  };

  private onLoadMoreHistoryOrders = () => {
    this.setState({historyOrdersLoadMoreStatus: 'loading'},
      this.loadMoreHistoryOrders);
  };

  private loadMoreHistoryOrders = () => {
    const lastIndex = this.state.historyOrders.length;
    apiHub.orderApi.getSellerHistoryOrders(lastIndex)
      .then((historyOrders) => {
        if (historyOrders && historyOrders.length) {
          this.setState({historyOrders: this.state.historyOrders.concat(historyOrders), historyOrdersLoadMoreStatus: 'more'});
        } else {
          this.setState({historyOrdersLoadMoreStatus: 'noMore'});
        }
      })
      .catch(this.onError);
  };

  private handleClick = (value) => {
    this.setState({
      currentTabIndex: value
    });
  };

  render() {
    const {
      loading, errMsg,
      isAccept, acceptLoading, sucMsg, atModalContent,
      currentTabIndex,
      ongoingOrders, ongoingOrdersLoadMoreStatus,
      historyOrders, historyOrdersLoadMoreStatus
    } = this.state;

    return (loading || (!acceptLoading && errMsg))
      ? (
        <LoadingPage loadingMsg={errMsg}/>
      )
      : (
        <View>

          {
            isAccept
              ? (
                <ConfirmModal loading={acceptLoading}
                              onCancel={this.handleCancel}
                              onConfirm={this.handleConfirm}
                              errMsg={errMsg}
                              sucMsg={sucMsg}
                              title="收货"
                              content={atModalContent}/>
              )
              : null
          }

          <AtTabs current={currentTabIndex} tabList={this.tabList} onClick={this.handleClick}>
            <WhiteSpace/>

            <AtTabsPane current={currentTabIndex} index={0}>
              <View>
                {ongoingOrders.map((o, idx) => <BoughtOrderCard key={idx} isBuyer={true} order={o} onAccept={() => this.onAcceptOrder(idx)}/>)}
              </View>
              <AtLoadMore
                moreBtnStyle={StyleHelper.loadMoreBtnStyle}
                onClick={this.onLoadMoreOngoingOrders}
                status={ongoingOrdersLoadMoreStatus}
              />
            </AtTabsPane>

            <AtTabsPane current={currentTabIndex} index={1}>
              <View>
                {historyOrders.map((o, idx) => <BoughtOrderCard key={idx} isBuyer={true} order={o}/>)}
              </View>
              <AtLoadMore
                moreBtnStyle={StyleHelper.loadMoreBtnStyle}
                onClick={this.onLoadMoreHistoryOrders}
                status={historyOrdersLoadMoreStatus}
              />
            </AtTabsPane>

          </AtTabs>

        </View>
      );
  }

  private onError = createSimpleErrorHandler('myBought', this);
}
