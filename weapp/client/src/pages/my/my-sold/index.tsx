import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {GoodsVO} from "../../../apis/GoodsApi";
import {apiHub} from "../../../apis/ApiHub";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import LoadingPage from "../../../components/common/loading-page";
import SoldGoodsCard from "../../../components/my/sold-goods-card";
import ConfirmModal from "../../../components/common/confirm-modal";
import {OrderVO} from "../../../apis/OrderApi";
import {AtLoadMore, AtTabs, AtTabsPane} from "taro-ui";
import WhiteSpace from "../../../components/common/white-space";

import '../../../styles/tab-title-fixed.scss';
import {StyleHelper} from "../../../styles/style-helper";
import BoughtOrderCard from "../../../components/my/bought-order-card";

interface IState {
  loading: boolean,
  goodsArr: Array<GoodsVO>,
  isDelete: boolean,
  deleteLoading: boolean,
  errMsg?: string,
  sucMsg?: string,
  deleteIdx: number,
  atModalContent: string,
  ongoingOrders: Array<OrderVO>,
  ongoingOrdersLoadMoreStatus?: 'more' | 'loading' | 'noMore',
  historyOrders: Array<OrderVO>,
  historyOrdersLoadMoreStatus?: 'more' | 'loading' | 'noMore',
  currentTabIndex: number
}

/**
 * 我的足迹
 * @author 张李承
 * @create 2019/8/6 23:39
 */
export default class index extends Component<any, IState> {

  private readonly defaultAtModalContent = '出错了，请取消操作';

  private readonly defaultDeleteState = {
    isDelete: false,
    deleteLoading: false,
    errMsg: undefined,
    sucMsg: undefined,
    deleteIdx: -1,
    atModalContent: this.defaultAtModalContent,
  };

  private cancelTimeout;

  config: Config = {
    navigationBarTitleText: '我卖出的'
  };

  private readonly tabList = [{ title: '正在出售' }, { title: '待送达' }, { title: '历史订单' }];

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      goodsArr: [],
      isDelete: false,
      deleteLoading: false,
      deleteIdx: -1,
      atModalContent: this.defaultAtModalContent,
      ongoingOrders: [],
      historyOrders: [],
      currentTabIndex: 0,
    };
  }

  componentWillMount() {
    Promise.all([
      apiHub.goodsApi.getOngoingGoods(),
      apiHub.orderApi.getSellerOngoingOrders(0),
      apiHub.orderApi.getSellerHistoryOrders(0)
    ])
      .then(([goodsArr, ongoingOrders, historyOrders]) => {
        this.setState({
          goodsArr, ongoingOrders, historyOrders,
          ongoingOrdersLoadMoreStatus: ongoingOrders.length? 'more': 'noMore',
          historyOrdersLoadMoreStatus: historyOrders.length? 'more': 'noMore',
          loading: false
        });
      })
      .catch(this.onError);
  }

  private onDeleteGoods = (deleteIdx: number) => {
    const goods = this.state.goodsArr[deleteIdx];
    const atModalContent = `确认要下架商品吗\n商品名：${goods.name}\n此操作无法撤销`;
    this.setState({...this.defaultDeleteState, isDelete: true, deleteIdx, atModalContent})
  };

  private handleCancel = () => {
    this.setState({...this.defaultDeleteState});
    clearTimeout(this.cancelTimeout);
  };

  private handleConfirm = () => {
    const {deleteIdx} = this.state;
    const goods = this.state.goodsArr[this.state.deleteIdx];
    const {_id} = goods;
    const that = this;
    this.setState({deleteLoading: true}, function () {
      apiHub.goodsApi.deleteGoods(_id)
        .then(function() {
          console.log('delete success', _id);
          const goodsArr = that.state.goodsArr;
          const sucMsg = `商品名：${goods.name}\n已下架成功`;
          that.setState({sucMsg, deleteLoading: false, goodsArr: goodsArr.slice(0, deleteIdx).concat(goodsArr.slice(deleteIdx + 1))}, function() {
            that.cancelTimeout = setTimeout(() => that.setState({...that.defaultDeleteState}), 1000);
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
      });
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
      });
  };

  private handleClick = (value) => {
    this.setState({
      currentTabIndex: value
    });
  };

  render() {
    const {
      loading, errMsg,
      goodsArr, isDelete, deleteLoading, sucMsg, atModalContent,
      currentTabIndex,
      ongoingOrders, ongoingOrdersLoadMoreStatus,
      historyOrders, historyOrdersLoadMoreStatus
    } = this.state;

    return loading || errMsg
      ? (
        <LoadingPage errMsg={errMsg}/>
      )
      : (
        <View>

          {
            isDelete
              ? (
                <ConfirmModal loading={deleteLoading}
                              onCancel={this.handleCancel}
                              onConfirm={this.handleConfirm}
                              errMsg={errMsg}
                              sucMsg={sucMsg}
                              title="下架确认"
                              content={atModalContent}/>
              )
              : null
          }

          <AtTabs current={currentTabIndex} tabList={this.tabList} onClick={this.handleClick}>
            <WhiteSpace/>

            <AtTabsPane current={currentTabIndex} index={0} >
              {goodsArr.map((g, idx) => <SoldGoodsCard key={idx} goods={g} onDeleteGoods={() => this.onDeleteGoods(idx)}/>)}
            </AtTabsPane>

            <AtTabsPane current={currentTabIndex} index={1}>
              <View>
                {ongoingOrders.map((o, idx) => <BoughtOrderCard key={idx} isBuyer={false} order={o}/>)}
              </View>
              <AtLoadMore
                moreBtnStyle={StyleHelper.loadMoreBtnStyle}
                onClick={this.onLoadMoreOngoingOrders}
                status={ongoingOrdersLoadMoreStatus}
              />
            </AtTabsPane>

            <AtTabsPane current={currentTabIndex} index={2}>
              <View>
                {historyOrders.map((o, idx) => <BoughtOrderCard key={idx} isBuyer={false} order={o}/>)}
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

  private onError = createSimpleErrorHandler('mySold', this);
}
