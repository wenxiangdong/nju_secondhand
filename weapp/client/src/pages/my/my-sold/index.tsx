import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {apiHub} from "../../../apis/ApiHub";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import LoadingPage from "../../../components/common/loading-page";
import {OrderVO} from "../../../apis/OrderApi";
import {AtLoadMore, AtTabs, AtTabsPane} from "taro-ui";
import WhiteSpace from "../../../components/common/white-space";
import {StyleHelper} from "../../../styles/style-helper";
import BoughtOrderCard from "../../../components/my/bought-order-card";

import '../../../styles/tab-title-fixed.scss';

interface IState {
  loading: boolean,
  errMsg?: string,
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

  config: Config = {
    navigationBarTitleText: '我卖出的'
  };

  private readonly tabList = [{ title: '进行中' }, { title: '已完结' }];

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      ongoingOrders: [],
      historyOrders: [],
      currentTabIndex: 0,
    };
  }

  componentWillMount() {
    Promise.all([
      apiHub.orderApi.getBuyerOngoingOrders(0, 10),
      apiHub.orderApi.getBuyerHistoryOrders(0, 10)
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
      currentTabIndex,
      ongoingOrders, ongoingOrdersLoadMoreStatus,
      historyOrders, historyOrdersLoadMoreStatus
    } = this.state;

    return loading || errMsg
      ? (
        <LoadingPage loadingMsg={errMsg}/>
      )
      : (
        <View>

          <AtTabs current={currentTabIndex} tabList={this.tabList} onClick={this.handleClick}>
            <WhiteSpace/>

            <AtTabsPane current={currentTabIndex} index={0}>
              <View>
                {ongoingOrders.map((o, idx) => <BoughtOrderCard key={idx} isBuyer={false} order={o}/>)}
              </View>
              <AtLoadMore
                moreBtnStyle={StyleHelper.loadMoreBtnStyle}
                onClick={this.onLoadMoreOngoingOrders}
                status={ongoingOrdersLoadMoreStatus}
              />
            </AtTabsPane>

            <AtTabsPane current={currentTabIndex} index={1}>
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
