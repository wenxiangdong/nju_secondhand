import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import LoadingPage from "../../../components/common/loading-page";
import {AtLoadMore, AtSearchBar} from "taro-ui";
import {GoodsWithSellerVO} from "../../../apis/GoodsApi";
import {indexSearchUrlConfig} from "../../../utils/url-list";
import {loadMoreBtnStyle} from "../../../styles/style-objects";
import {apiHub} from "../../../apis/ApiHub";
import GoodsCard from "../../../components/index/goods-card";

interface IState {
  searchValue: string,
  loading: boolean,
  errMsg?: string,
  loadMoreStatus?: 'more' | 'loading' | 'noMore',
  goodsWithSeller: Array<GoodsWithSellerVO>,
  searchDisabled: boolean,
}

/**
 * SearchResult
 * @author 张李承
 * @create 2019/7/26 11:09
 */
export default class SearchResult extends Component<any, IState> {

  private readonly NOT_FIND_CATEGORY_ERROR:Error = new Error('未找到搜索关键词请重试');

  private beforeSearchValue: string;

  config: Config = {
    navigationBarTitleText: '搜索'
  };

  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      loading: true,
      goodsWithSeller: [],
      searchDisabled: true
    };
  }

  componentWillMount() {
    this.initSearchValue()
      .then(searchValue => {
        this.setState({searchValue, loading: false, loadMoreStatus: 'loading'},
          this.searchGoodsWithSeller)
    }).catch(this.onError);
  }

  private initSearchValue = async (): Promise<string> => {
    const word = indexSearchUrlConfig.getSearchWord(this);
    if (word && word.length) {
      this.beforeSearchValue = word;
      return Promise.resolve(word);
    } else {
      throw this.NOT_FIND_CATEGORY_ERROR;
    }
  };

  private searchGoodsWithSeller = () => {
    const lastIndex = this.state.goodsWithSeller.length;
    const word = this.state.searchValue;
    if (word) {
      apiHub.goodsApi.searchGoodsWithSellerByKeyword(word, lastIndex)
        .then((goodsWithSeller) => {
          if (goodsWithSeller && goodsWithSeller.length) {
            this.setState({goodsWithSeller: this.state.goodsWithSeller.concat(goodsWithSeller), loadMoreStatus: 'more', searchDisabled: false});
          } else {
            this.setState({loadMoreStatus: 'noMore', searchDisabled: false});
          }
        })
    } else {
      throw this.NOT_FIND_CATEGORY_ERROR;
    }
  };

  private reSearch = () => {
    const { searchValue } = this.state;
    if (searchValue && searchValue !== this.beforeSearchValue) {
      this.setState({loadMoreStatus: 'loading', searchDisabled: true, goodsWithSeller: []},
        this.searchGoodsWithSeller);
    }
  };

  private onLoadMore = () => {
    this.setState({loadMoreStatus: 'loading', searchDisabled: true},
      this.searchGoodsWithSeller);
  };

  render() {
    const {loading, errMsg, loadMoreStatus, goodsWithSeller, searchValue, searchDisabled} = this.state;

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
            moreBtnStyle={loadMoreBtnStyle}
            onClick={this.onLoadMore}
            status={loadMoreStatus}
          />
        </View>
      );
  }

  private onError = createSimpleErrorHandler('SearchResult', this);
}
