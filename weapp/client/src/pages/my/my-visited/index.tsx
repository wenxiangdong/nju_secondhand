import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {GoodsWithSellerVO} from "../../../apis/GoodsApi";
import {apiHub} from "../../../apis/ApiHub";
import {AtLoadMore, AtSearchBar} from "taro-ui";
import GoodsCard from "../../../components/index/goods-card";
import {loadMoreBtnStyle} from "../../../styles/style-objects";

interface IState {
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
          this.setState({goodsWithSeller: this.state.goodsWithSeller.concat(goodsWithSeller), loadMoreStatus: 'more', searchDisabled: false});
        } else {
          this.setState({loadMoreStatus: 'noMore', searchDisabled: false});
        }
      });
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
    const {loadMoreStatus, goodsWithSeller, searchValue, searchDisabled} = this.state;

    return (
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
}
