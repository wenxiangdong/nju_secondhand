import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {GoodsVO} from "../../../apis/GoodsApi";
import {apiHub} from "../../../apis/ApiHub";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import LoadingPage from "../../../components/common/loading-page";
import SoldGoodsCard from "../../../components/my/sold-goods-card";

interface IState {
  loading: boolean,
  errMsg?: string,
  goodsArr: Array<GoodsVO>
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

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      goodsArr: [],
    };
  }

  componentWillMount() {
    apiHub.goodsApi.getOngoingGoods()
      .then(goodsArr => {
        this.setState({goodsArr, loading: false});
      })
      .catch(this.onError);
  }

  private onDeleteGoods = (idx: number) => {

  };

  private confirmDeleteGoods = (idx: number) => {
    const goods = this.state.goodsArr[idx];
    const {_id} = goods;
    apiHub.goodsApi.deleteGoods(_id)
      .then(() => {
        console.log('delete success', _id);
        const goodsArr = this.state.goodsArr;
        this.setState({goodsArr: goodsArr.slice(0, idx).concat(goodsArr.slice(idx + 1))});
      })
      .catch(this.onError)
    ;
  };

  render() {
    const {loading, errMsg, goodsArr} = this.state;

    return loading || errMsg
      ? (
        <LoadingPage errMsg={errMsg}/>
      )
      : (
        <View>
          {goodsArr.map((g, idx) => <SoldGoodsCard key={idx} goods={g} onDeleteGoods={() => this.onDeleteGoods(idx)}/>)}
        </View>
      );
  }

  private onError = createSimpleErrorHandler('mySold', this);
}
