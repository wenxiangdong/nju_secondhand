import "@tarojs/async-await";
import Taro, {Component} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import {CategoryVO, GoodsVO} from "../../../apis/GoodsApi";
import localConfig from "../../../utils/local-config";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import LoadingPage from "../../../components/common/loading-page";
import {AtLoadMore} from "taro-ui";

interface IState {
  category?: CategoryVO,
  goods: GoodsVO[],
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

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      goods: []
    };
  }

  componentWillMount() {
    Promise.all([
      this.initCategory()
    ]).then(value => {
      const category = value[0];
      Taro.setNavigationBarTitle({title: category.name})
        .catch(this.onError);
      this.setState({category, loading: false});
    }).catch(this.onError);
  }

  private initCategory = async function(): Promise<CategoryVO> {
    const category = localConfig.getGoodsCategory();
    if (!category) {
      throw new Error('未找到类别请重试');
    }
    return Promise.resolve(category);
  };

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
  }

  private loadMore = async (): Promise<GoodsVO[]> => {
    // TODO 优先级 中 搜索
    return Promise.resolve([]);
  };

  private onLoadMore = () => {
    this.setState({loadMoreStatus: 'loading'});
    this.loadMore()
      .then((goods) => {
        if (goods && goods.length) {
          this.setState({goods: this.state.goods.concat(goods), loadMoreStatus: 'more'});
        } else {
          this.setState({loadMoreStatus: 'noMore'});
        }
      })
      .catch(this.onError);
  };

  render() {
    const {loading, errMsg, loadMoreStatus} = this.state;

    return loading
      ? (
        <LoadingPage errMsg={errMsg}/>
      )
      : (
        <View>
          <Text>CategoryGoods works</Text>
          <AtLoadMore
            onClick={this.onLoadMore}
            status={loadMoreStatus}
          />
        </View>
      );
  }

  private onError = createSimpleErrorHandler('CategoryGoods', this);
}
