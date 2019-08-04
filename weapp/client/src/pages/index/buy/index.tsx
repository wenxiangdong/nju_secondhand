import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import {GoodsVO} from "../../../apis/GoodsApi";
import LoadingPage from "../../../components/common/loading-page";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import {buyUrlConfig} from "../../../utils/url-list";
import {apiHub} from "../../../apis/ApiHub";

interface IState {
  loading: boolean,
  errMsg?: string,
  goodsInfo?: GoodsVO
}

/**
 * 买买买
 * @author 张李承
 * @create 2019/8/4 11:38
 */
export default class index extends Component<any, IState> {

  private readonly NOT_FIND_GOODS_ID_ERROR:Error = new Error('未找到商品的信息请重试');

  config: Config = {
    navigationBarTitleText: '买买买'
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentWillMount() {
    this.getGoodsInfo()
      .then(goodsInfo => this.setState({goodsInfo, loading: false}))
      .catch(this.onError);
  }

  private getGoodsInfo = async (): Promise<GoodsVO> => {
    const goodsId = buyUrlConfig.getGoodsId(this);
    if (goodsId && goodsId.length) {
      return apiHub.goodsApi.getGoods(goodsId);
    } else {
      throw this.NOT_FIND_GOODS_ID_ERROR;
    }
  };

  render() {
    const {loading, errMsg} = this.state;

    return (loading || errMsg
        ? (
          <LoadingPage errMsg={errMsg}/>
        )
        : (
          <View>
            <Text>Buy works</Text>
          </View>
        )
    );
  }

  private onError = createSimpleErrorHandler('Buy', this);
}
