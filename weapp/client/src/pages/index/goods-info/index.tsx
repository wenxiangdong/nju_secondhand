import Taro, {Component, Config} from '@tarojs/taro'
import {Text, View} from '@tarojs/components'
import {AtDivider} from "taro-ui";
import {GoodsState, GoodsWithSellerVO, MockGoodsApi} from "../../../apis/GoodsApi";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import {goodsInfoUrlConfig} from "../../../utils/url-list";
import {apiHub} from "../../../apis/ApiHub";
import GoodsBriefInfoCard from "../../../components/index/goods-brief-info-card";
import LoadingPage from "../../../components/common/loading-page";
import UserInfoCard from "../../../components/index/user-info-card";
import GoodsInfoCard from "../../../components/index/goods-info-card";
import GoodsInfoBottomBar from "../../../components/index/goods-info-bottom-bar";
import localConfig from "../../../utils/local-config";

interface IState {
  loading: boolean,
  errMsg?: string,
  goodsWithSeller: GoodsWithSellerVO,
}

/**
 * 商品信息
 * @create 2019/7/25 11:49
 */
export class index extends Component<any, IState> {

  private readonly NOT_FIND_GOODS_ID_ERROR:Error = new Error('未找到商品\n请重试');
  private readonly GOODS_DELETED_ERROR:Error = new Error('商品已经被抢走了\nQwQ');

  config: Config = {
    navigationBarTitleText: '商品信息'
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      goodsWithSeller: MockGoodsApi.createMockGoodsWithSeller()
    };
  }

  componentWillMount() {
    this.refreshGoodsWithSeller();
  }

  private refreshGoodsWithSeller = () => {
    this.setState({loading: true}, () => {
      this.initGoodsWithSeller()
        .then(goodsWithSeller => {
          const state = goodsWithSeller.goods.state;
          switch (state) {
            case GoodsState.InSale:
              localConfig.addVisitedGoodsWithSeller(goodsWithSeller);
              this.setState({goodsWithSeller, loading: false});
              break;
            case GoodsState.Deleted:
              localConfig.removeVisitedGoodsWithSeller(goodsWithSeller);
              throw this.GOODS_DELETED_ERROR;
            default:
              throw this.NOT_FIND_GOODS_ID_ERROR;
          }
        })
        .catch(this.onError);
    });
  };

  private initGoodsWithSeller = async (): Promise<GoodsWithSellerVO> => {
    const goodsId = goodsInfoUrlConfig.getGoodsId(this);
    if (goodsId && goodsId.length) {
      return apiHub.goodsApi.getGoodsWithSeller(goodsId);
    } else {
      throw this.NOT_FIND_GOODS_ID_ERROR;
    }
  };

  render() {
    const {goodsWithSeller, loading, errMsg} = this.state;
    const {seller, goods} = goodsWithSeller;

    return (loading || errMsg
      ? (
        <LoadingPage loadingMsg={errMsg}/>
      )
      : (
          <View style={{padding: '30px'}}>
            <GoodsBriefInfoCard goodsWithSeller={goodsWithSeller}/>
            <AtDivider content='商品详情'/>
            <GoodsInfoCard goods={goods}/>
            <AtDivider content='关于卖家'/>
            <UserInfoCard user={seller}/>

            {/* TODO 优先级 低*/}
            <AtDivider content='问题互动'/>
            <Text>TODO 搁置</Text>
            <AtDivider content='相似商品'/>
            <Text>TODO 搁置</Text>

            <GoodsInfoBottomBar goodsWithSeller={goodsWithSeller}/>
          </View>
      )
    )
  }

  private onError = createSimpleErrorHandler('SearchResult', this);
}
