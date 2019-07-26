import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import LoadingPage from "../../../components/common/loading-page";
import {AtLoadMore} from "taro-ui";
import {GoodsVO} from "../../../apis/GoodsApi";

interface IState {
  word?: string,
  loading: boolean,
  errMsg?: string,
  loadMoreStatus?: 'more' | 'loading' | 'noMore',
  goods: Array<GoodsVO>,
}

/**
 * SearchResult
 * @author 张李承
 * @create 2019/7/26 11:09
 */
export default class SearchResult extends Component<any, IState> {

  config: Config = {
    navigationBarTitleText: '搜索'
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      goods: []
    };
  }

  componentWillMount() {
    Promise.all([
      this.initWord(),
      this.loadMore(),
    ]).then(value => {
      const word = value[0];
      this.setState({word, loading: false});
    }).catch(this.onError);
  }

  private initWord = async (): Promise<string> => {
    const word = this.$router.params.word;
    if (!(word && word.length)) {
      throw new Error('未找到搜索关键词请重试')
    }
    return Promise.resolve(word);
  };

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
          <Text>SearchResult works</Text>
          <AtLoadMore
            onClick={this.onLoadMore}
            status={loadMoreStatus}
          />
        </View>
      );
  }

  private onError = createSimpleErrorHandler('SearchResult', this);
}
