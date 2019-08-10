import "@tarojs/async-await";
import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import DSwiper from "../../components/common/d-swiper";
import {AtGrid, AtSearchBar, AtMessage} from "taro-ui";
import {Item} from "taro-ui/@types/grid";
import localConfig from '../../utils/local-config'
import {createSimpleErrorHandler} from "../../utils/function-factory";
import {CategoryVO} from "../../apis/GoodsApi";
import {CommonEvent} from "@tarojs/components/types/common";
import urlList, {indexSearchUrlConfig} from "../../utils/url-list";
import LoadingPage from "../../components/common/loading-page";
import {apiHub} from "../../apis/ApiHub";
import MainTabBar from "../../components/common/main-tab-bar";

interface IState {
  searchValue: string,
  swiperSrcs: Array<string>,
  categories: Array<CategoryVO>,
  loading: boolean,
  errMsg?: string
}

/**
 * 首页
 * @create 2019/7/25 11:49
 */
class index extends Component<any, IState> {

  config: Config = {
    navigationBarTitleText: '首页'
  };

  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      swiperSrcs: [],
      categories: [],
      loading: true
    };
  }

  componentWillMount() {
    Promise.all([
      this.getSwiperSrcs(),
      this.getCategories()
    ])
      .then(value => this.setState({swiperSrcs: value[0], categories: value[1], loading: false}))
      .catch(this.onError);
  }

  private getSwiperSrcs = async function(): Promise<string[]> {
    //  TODO 优先级 低 获取 swiperSrcs
    return Promise.resolve(['', '', '']);
  };

  private getCategories = async function(): Promise<CategoryVO[]> {
    return apiHub.goodsApi.getCategories();
  };

  private transferCategoryDate = (categories: Array<CategoryVO>) => {
    return categories.map((c) => ({image:c.icon, value: c.name}));
  };

  private onSearch = () => {
    const { searchValue } = this.state;
    if (searchValue) {
      console.info('index onSearch', searchValue);
      Taro.navigateTo({
        url: indexSearchUrlConfig.createUrl(searchValue)
      }).catch(this.onError);
    }
  };

  private onCategoryClick = (item: Item, index: number, event: CommonEvent) => {
    console.info('index onCategoryClick', item, index, event);
    localConfig.setGoodsCategory(this.state.categories[index]);
    Taro.navigateTo({url: urlList.INDEX_CATEGORY_GOODS})
      .catch(this.onError);
  };

  private onError = createSimpleErrorHandler('index', this);

  render() {
    const {searchValue, swiperSrcs, categories, loading, errMsg} = this.state;
    const categoryData = this.transferCategoryDate(categories);

    return loading || errMsg
      ? (
        <LoadingPage errMsg={errMsg}/>
      )
      : (
        <View>
          <AtSearchBar
            placeholder='请输入关键词搜索'
            maxLength={20}
            value={searchValue}
            onChange={(searchValue) => this.setState({searchValue})}
            onActionClick={this.onSearch}
          />
          <DSwiper srcs={swiperSrcs}/>
          <AtGrid hasBorder={false} data={categoryData} onClick={this.onCategoryClick}/>
          <MainTabBar currentIndex={MainTabBar.HOME_INDEX}/>
          <AtMessage />
        </View>
      );
  }
}

export default index;
