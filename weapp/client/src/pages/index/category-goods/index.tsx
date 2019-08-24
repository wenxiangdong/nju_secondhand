import "@tarojs/async-await";
import Taro, {Component} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {CategoryVO, GoodsWithSellerVO} from "../../../apis/GoodsApi";
import localConfig from "../../../utils/local-config";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import LoadingPage from "../../../components/common/loading-page";
import {AtLoadMore, AtMessage} from "taro-ui";
import {apiHub} from "../../../apis/ApiHub";
import GoodsCard from "../../../components/index/goods-card";
import {StyleHelper} from "../../../styles/style-helper";

interface IState {
  category?: CategoryVO,
  goodsWithSeller: GoodsWithSellerVO[],
  loading: boolean,
  errMsg?: string,
  loadMoreStatus?: 'more' | 'loading' | 'noMore',
}

/**
 * CategoryGoods
 * @author 张李承
 * @create 2019/7/26 9:29
 */
export default class CategoryGoods extends Component<any, IState> {

  private readonly NOT_FIND_CATEGORY_ERROR:Error = new Error('未找到类别\n请重试');

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      goodsWithSeller: []
    };
  }

  componentWillMount() {
    this.initCategory()
      .then(category => {
        Taro.setNavigationBarTitle({title: category.name})
          .catch(this.onError);
        this.setState({category, loading: false, loadMoreStatus: 'loading'},
          this.searchGoodsWithSeller);
      })
      .catch(this.onError);
  }

  private initCategory = async (): Promise<CategoryVO> => {
    const category = localConfig.getGoodsCategory();
    if (category) {
      return Promise.resolve(category);
    } else {
      throw this.NOT_FIND_CATEGORY_ERROR;
    }
  };

  private searchGoodsWithSeller = () => {
    const lastIndex = this.state.goodsWithSeller.length;
    if (this.state.category) {
      const { _id } = this.state.category;
      apiHub.goodsApi.searchGoodsWithSellerByCategory(_id, lastIndex, 10)
        .then((goodsWithSeller) => {
          if (goodsWithSeller && goodsWithSeller.length) {
            this.setState({goodsWithSeller: this.state.goodsWithSeller.concat(goodsWithSeller), loadMoreStatus: 'more'});
          } else {
            this.setState({loadMoreStatus: 'noMore'});
          }
        })
        .catch(this.onError);
    } else {
      throw this.NOT_FIND_CATEGORY_ERROR;
    }
  };

  private onLoadMore = () => {
    this.setState({loadMoreStatus: 'loading'},
      this.searchGoodsWithSeller);
  };

  render() {
    const {loading, errMsg, loadMoreStatus, goodsWithSeller} = this.state;

    return loading || errMsg
      ? (
        <LoadingPage loadingMsg={errMsg}/>
      )
      : (
        <View>
          <View>
            {
              goodsWithSeller.map((g, idx) =>
                <GoodsCard key={`goods-card-${idx}-${g.goods._id}`} goodsWithSeller={g}/>)
            }
          </View>
          <AtLoadMore
            moreBtnStyle={StyleHelper.loadMoreBtnStyle}
            onClick={this.onLoadMore}
            status={loadMoreStatus}
          />
          <AtMessage />
        </View>
      );
  }

  private onError = createSimpleErrorHandler('CategoryGoods', this);
}
