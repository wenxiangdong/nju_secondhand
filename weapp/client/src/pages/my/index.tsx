import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import MainTabBar from "../../components/common/main-tab-bar";
import UserInfoBar from "../../components/common/UserInfoBar/UserInfoBar";
import {createSimpleErrorHandler} from "../../utils/function-factory";
import {AtList, AtListItem} from "taro-ui";
import {AtListItemProps} from "taro-ui/@types/list";

interface IState {
  mounted: boolean
}

/**
 * 个人
 * @create 2019/7/25 11:49
 */
export class index extends Component<any, IState> {

  config: Config = {
    navigationBarTitleText: '个人'
  };

  private navigatorBarPropArr: (AtListItemProps & {page: string})[] = [
    {
      page:'/pages/my/my-visited/index',
      title: '我的足迹',
      iconInfo: {value: 'bookmark'},
    },
    {
      page:'/pages/my/my-bought/index',
      title: '我买到的',
      iconInfo: {value: 'shopping-bag'},
    },
    {
      page:'/pages/my/my-publish/index',
      title: '我发布的',
      iconInfo: {value: 'tag'},
    },
    {
      page:'/pages/my/my-sold/index',
      title: '我卖出的',
      iconInfo: {value: 'shopping-bag-2'},
    },
    {
      page:'/pages/my/platform-account/index',
      title: '平台账户',
      iconInfo: {value: 'credit-card'},
    },
    {
      page:'/pages/my/software-license-agreement/index',
      title: '软件许可使用协议',
      iconInfo: {value: 'heart'},
    },
    {
      page:'/pages/my/privacy-policy/index',
      title: '隐私权条款',
      iconInfo: {value: 'bullet-list'},
    },
    {
      page:'/pages/my/platform-rules/index',
      title: '平台规则',
      iconInfo: {value: 'star'},
    },
  ];

  constructor(props) {
    super(props);

    this.state = {
      mounted: false
    };

    this.navigatorBarPropArr.forEach((prop) => {
      let iconInfo = prop.iconInfo;
      if (iconInfo) {
        iconInfo.size = 18;
      }
    });
  }

  private onError = createSimpleErrorHandler('my', this);

  private onUserInfoClick = () => {
    Taro.navigateTo({url: '/pages/my/user-info/index'})
      .catch((e) => this.onError(e));
  };

  private onNavigatorBarClick = (idx) => {
    const barProp = this.navigatorBarPropArr[idx];
    console.info('my onNavigatorBarClick', barProp);
    Taro.navigateTo({url: barProp.page})
      .catch((e) => this.onError(e));
  };

  render() {
    const {mounted} = this.state;

    return (
      <View className={'center-view'}>
        <View onClick={this.onUserInfoClick} className={`user-bar-box ${mounted ? `fly-in-1`: ``}`}>
          <UserInfoBar/>
        </View>
        <AtList hasBorder={false}>
          {this.navigatorBarPropArr.map(
            (prop, idx) => {
              return <AtListItem key={`${prop.title}-${idx}`} arrow={'right'} title={prop.title}
                          onClick={() => this.onNavigatorBarClick(idx)} iconInfo={prop.iconInfo}/>
            }
          )}
        </AtList>
        <MainTabBar currentIndex={MainTabBar.MY_INDEX}/>
      </View>
    )
  }
}
