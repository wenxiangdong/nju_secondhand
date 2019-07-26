import Taro, {Component} from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtTabBar } from 'taro-ui'
import { TabItem } from 'taro-ui/@types/tab-bar'
import SelectPublish from './select-publish'
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import WhiteSpace from "../white-space";
import urlList from "../../../utils/url-list";

interface IProp {
  currentIndex: number
}
interface IState {
  selectingPublish: boolean
}

/**
 * 参考 pl 代码重构的 TabBar 组件
 * TODO 优先级 低 加一个贴图把中间的发布遮住做出原型图的效果
 * @create 2019/7/25 16:39
 */
export default class MainTabBar extends Component<IProp, IState> {
  static defaultProps:IProp = {currentIndex: 0};

  static TAB_BAR_LIST: (TabItem & {page: string})[] = [
    {
      title: '首页',
      iconType: 'home',
      page: urlList.INDEX
    },
    {
      title: '圈子',
      iconType: 'eye',
      page: urlList.CIRCLE
    },
    {
      title: '发布',
      iconType: 'add-circle',
      page: urlList.ERROR
    },
    {
      title: '消息',
      iconType: 'message',
      page: urlList.MESSAGE
    },
    {
      title: '个人',
      iconType: 'user',
      page: urlList.MY
    },
  ];

  static HOME_INDEX = 0;
  static CIRCLE_INDEX = 1;
  static PUBLISH_INDEX = 2;
  static MESSAGE_INDEX = 3;
  static MY_INDEX = 4;

  constructor(props) {
    super(props);
    this.state = {
      selectingPublish: false
    };
  }

  private onError = createSimpleErrorHandler('MainTabBar', this);

  private onTabClicked = (index) => {
    if (index !== this.props.currentIndex) {
      if (index === MainTabBar.PUBLISH_INDEX) {
        console.info('MainTabBar onTabClicked select publish');
        this.setState({selectingPublish: true});
      } else {
        const url = MainTabBar.TAB_BAR_LIST[index].page;
        console.info(`MainTabBar onTabClicked index: ${index} url: `, url);

        Taro.reLaunch({url})
          .catch(this.onError);
      }
    }
  };

  private onCancelSelectingPublish = () => {
    this.setState({selectingPublish: false});
  };

  render () {
    const {currentIndex} = this.props;
    const {selectingPublish} = this.state;
    const title = MainTabBar.TAB_BAR_LIST[currentIndex].title;
    const selectPublishTitle = MainTabBar.TAB_BAR_LIST[MainTabBar.PUBLISH_INDEX].title;

    return (
      <View>
        <WhiteSpace/>
        {selectingPublish? <SelectPublish previousTitle={title} title={selectPublishTitle} onCancel={this.onCancelSelectingPublish}/>: null}
        <AtTabBar fixed current={currentIndex} tabList={MainTabBar.TAB_BAR_LIST} onClick={this.onTabClicked}/>
      </View>
    );
  }
}
