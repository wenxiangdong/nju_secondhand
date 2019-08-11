import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {GoodsWithSellerVO} from "../../../apis/GoodsApi";
import {apiHub} from "../../../apis/ApiHub";
import {AtLoadMore, AtSearchBar} from "taro-ui";
import GoodsCard from "../../../components/index/goods-card";
import {StyleHelper} from "../../../styles/style-helper";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import LoadingPage from "../../../components/common/loading-page";

interface IState {
  loading: boolean,
  errMsg?: string,
  searchValue: string,
  loadMoreStatus?: 'more' | 'loading' | 'noMore',
  goodsWithSeller: Array<GoodsWithSellerVO>,
  searchDisabled: boolean,
}

/**
 * 我的足迹
 * @author 张李承
 * @create 2019/8/6 23:39
 */
export default class index extends Component<any, IState> {

  private readonly beforeSearchValue: string;

  config: Config = {
    navigationBarTitleText: '我的足迹'
  };

  constructor(props) {
    super(props);
    this.beforeSearchValue = '';
    this.state = {
      loading: true,
      searchValue: '',
      goodsWithSeller: [],
      searchDisabled: true
    };
  }

  componentWillMount() {
    this.onLoadMore();
  }

  private searchVisitedGoodsWithSeller = () => {
    const lastIndex = this.state.goodsWithSeller.length;
    const word = this.state.searchValue;
    apiHub.goodsApi.getVisitedGoodsWithSeller(word, lastIndex)
      .then((goodsWithSeller) => {
        if (goodsWithSeller && goodsWithSeller.length) {
          this.setState({loading: false, goodsWithSeller: this.state.goodsWithSeller.concat(goodsWithSeller), loadMoreStatus: 'more', searchDisabled: false});
        } else {
          this.setState({loading: false, loadMoreStatus: 'noMore', searchDisabled: false});
        }
      })
      .catch(this.onError);
  };

  private reSearch = () => {
    const { searchValue } = this.state;
    if (searchValue && searchValue !== this.beforeSearchValue) {
      this.setState({loadMoreStatus: 'loading', searchDisabled: true, goodsWithSeller: []},
        this.searchVisitedGoodsWithSeller);
    }
  };

  private onLoadMore = () => {
    this.setState({loadMoreStatus: 'loading', searchDisabled: true},
      this.searchVisitedGoodsWithSeller);
  };

  render() {
    const {
      loading, errMsg,
      loadMoreStatus, goodsWithSeller, searchValue, searchDisabled
    } = this.state;

    return loading || errMsg
      ? (
        <LoadingPage errMsg={errMsg}/>
      )
      : (
        <View>
          <AtSearchBar
            placeholder='请输入关键词搜索'
            disabled={searchDisabled}
            maxLength={20}
            value={searchValue}
            onChange={(searchValue) => this.setState({searchValue})}
            onActionClick={this.reSearch}
          />
          <View>
            {goodsWithSeller.map((g, idx) => <GoodsCard key={`goods-card-${idx}-${g.goods._id}`} goodsWithSeller={g}/>)}
          </View>
          <AtLoadMore
            moreBtnStyle={StyleHelper.loadMoreBtnStyle}
            onClick={this.onLoadMore}
            status={loadMoreStatus}
          />
        </View>
      );
  }

  private onError = createSimpleErrorHandler('myVisited', this);
}
