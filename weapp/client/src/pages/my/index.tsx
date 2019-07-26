import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import MainTabBar from "../../components/common/main-tab-bar";
import UserInfoBar from "../../components/common/user-info-bar/index";
import {createSimpleErrorHandler} from "../../utils/function-factory";
import {AtList, AtListItem} from "taro-ui";
import {AtListItemProps} from "taro-ui/@types/list";
import urlList from "../../utils/url-list";

interface IState {
  mounted: boolean
}

/**
 * 个人
 * @create 2019/7/25 11:49
 */
export class My extends Component<any, IState> {

  config: Config = {
    navigationBarTitleText: '个人'
  };

  private navigatorBarPropArr: (AtListItemProps & {page: string})[] = [
    {
      page: urlList.MY_VISITED,
      title: '我的足迹',
      iconInfo: {value: 'bookmark'},
    },
    {
      page: urlList.MY_BOUGHT,
      title: '我买到的',
      iconInfo: {value: 'shopping-bag'},
    },
    {
      page: urlList.MY_PUBLISH,
      title: '我发布的',
      iconInfo: {value: 'tag'},
    },
    {
      page: urlList.MY_SOLD,
      title: '我卖出的',
      iconInfo: {value: 'shopping-bag-2'},
    },
    {
      page: urlList.MY_PLATFORM_ACCOUNT,
      title: '平台账户',
      iconInfo: {value: 'credit-card'},
    },
    {
      page: urlList.MY_SOFTWARE_LICENSE_AGREEMENT,
      title: '软件许可使用协议',
      iconInfo: {value: 'heart'},
    },
    {
      page: urlList.MY_PRIVACY_POLICY,
      title: '隐私权条款',
      iconInfo: {value: 'bullet-list'},
    },
    {
      page: urlList.MY_PLATFORM_RULES,
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
    Taro.navigateTo({url: urlList.MY_USER_INFO})
      .catch(this.onError);
  };

  private onNavigatorBarClick = (idx) => {
    const barProp = this.navigatorBarPropArr[idx];
    console.info('my onNavigatorBarClick', barProp);
    Taro.navigateTo({url: barProp.page})
      .catch(this.onError);
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
