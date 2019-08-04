import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import {AtDivider} from "taro-ui";
import {GoodsWithSellerVO, MockGoodsApi} from "../../../apis/GoodsApi";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import {goodsInfoUrlConfig} from "../../../utils/url-list";
import {apiHub} from "../../../apis/ApiHub";
import GoodsBriefInfoCard from "../../../components/index/goods-brief-info-card";
import LoadingPage from "../../../components/common/loading-page";
import UserInfoCard from "../../../components/index/user-info-card";
import GoodsInfoCard from "../../../components/index/goods-info-card";
import GoodsInfoBottomBar from "../../../components/index/goods-info-bottom-bar";

interface IState {
  loading: boolean,
  errMsg?: string,
  goodsWithSeller?: GoodsWithSellerVO,
}

/**
 * 商品信息
 * @create 2019/7/25 11:49
 */
export class index extends Component<any, IState> {

  private readonly NOT_FIND_GOODS_ID_ERROR:Error = new Error('未找到选择的商品请重试');

  config: Config = {
    navigationBarTitleText: '商品信息'
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentWillMount() {
    this.refreshGoodsWithSeller();
  }

  private refreshGoodsWithSeller = () => {
    this.setState({loading: true}, () => {
      this.initGoodsWithSeller()
        .then(goodsWithSeller => {
          this.setState({goodsWithSeller, loading: false})
        }).catch(this.onError);
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
    const {goodsWithSeller = MockGoodsApi.createMockGoodsWithSeller(), loading, errMsg} = this.state;
    const {seller, goods} = goodsWithSeller;

    return (loading || errMsg
      ? (
        <LoadingPage errMsg={errMsg}/>
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
