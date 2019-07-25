import Taro, {Component, Config} from '@tarojs/taro'
import {Text, View} from '@tarojs/components'
import MainTabBar from "../../components/common/main-tab-bar";
import HomeSwiper from "../../components/index/home-swiper";
import {AtActivityIndicator, AtGrid, AtSearchBar} from "taro-ui";
import {Item} from "taro-ui/@types/grid";
import localConfig from '../../utils/local-config'
import {createSimpleErrorHandler} from "../../utils/function-factory";
import {CategoryVO} from "../../apis/GoodsApi";

interface IState {
  searchValue: string,
  swiperSrcs: Array<string>,
  categoryData: Array<Item>,
  loading: boolean,
  windowHeight: number
}

/**
 * 首页
 * @create 2019/7/25 11:49
 */
export default class index extends Component<any, IState> {

  config: Config = {
    navigationBarTitleText: '首页'
  };

  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
      swiperSrcs: [],
      categoryData: [],
      loading: true,
      windowHeight: 0
    };
  }

  componentWillMount() {
    try {
      const swiperSrcs = this.getSwiperSrcs();
      const categoryData = this.getCategoryData();
      const windowHeight = localConfig.getSystemSysInfo().windowHeight;
      this.setState({swiperSrcs, categoryData, windowHeight, loading: false});
    } catch (e) {
      this.onError(e);
    }
  }

  private getSwiperSrcs = () => {
    //  TODO 优先级 低 获取 swiperSrcs
    return ['', '', ''];
  };

  private getCategoryData = () => {
    //  TODO 优先级 中 获取 categoryData
    // const categories: Array<CategoryVO> = [];

    // TODO test
    const categories: Array<CategoryVO> = [
      {name: '数码', icon: '', _id: '1'},
      {name: '二手图书', icon: '', _id: '1'},
      {name: '服饰鞋包', icon: '', _id: '1'},
      {name: '美妆', icon: '', _id: '1'},
      {name: '二手车', icon: '', _id: '1'},
      {name: '全部分类', icon: '', _id: '1'},
    ];

    return this.transferCategoryDate(categories);
  };

  private transferCategoryDate = (categories: Array<CategoryVO>) => {
    return categories.map((c) => ({image:c.icon, value: c.name}));
  };

  private onSearch = (value) => {
    // TODO 优先级 中 搜索
    console.info('index onSearch', value);
  };

  private onSearchChange = (searchValue) => {
    this.setState({searchValue});
    return searchValue;
  };

  private onError = createSimpleErrorHandler('index', this);

  render() {
    const {searchValue, swiperSrcs, categoryData, loading, windowHeight} = this.state;

    return loading
      ? (
        <View style={{position: 'relative', height: `${windowHeight}px`}}>
          <AtActivityIndicator content='加载中...' size={32} mode='center'/>
        </View>
      )
      : (
        <View>
          <AtSearchBar
            actionName='搜一下'
            value={searchValue}
            onChange={this.onSearchChange}
            onActionClick={(value) => this.onSearch(value)}
          />
          <HomeSwiper srcs={swiperSrcs}/>
          <AtGrid hasBorder={false} data={categoryData}/>
          <Text>首页 works</Text>
          <MainTabBar currentIndex={MainTabBar.HOME_INDEX}/>
        </View>
      );
  }
}
