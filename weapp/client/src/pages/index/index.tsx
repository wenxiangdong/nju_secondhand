import Taro, { Component, Config } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss';
import Home from "../../components/index/home";
import WhiteSpace from "../../components/common/white-space";
import Add from "../../components/index/add";
import {TabItem} from "taro-ui/@types/tab-bar";
import {AtTabBar} from "taro-ui";
import Me from "../../components/index/me";

interface IState {
  currentIndex: number
}

const TAB_BAR_LIST: (TabItem & {page: any})[] = [
  {
    title: "首页",
    iconType: "home",
    page: 'Home'
  },
  {
    title: "圈子",
    iconType: "eye",
    page: 'Home'
  },
  {
    title: "发布",
    iconType: "add-circle",
    page: 'Home'
  },
  {
    title: "消息",
    iconType: "message",
    page: 'Home'
  },
  {
    title: "个人",
    iconType: "user",
    page: 'Home'
  },
];

export default class Index extends Component<any, IState> {

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '首页'
  };

  state = {
    currentIndex: 0
  };


  // handles
  handleClickTab = (index) => {
    console.log(index);
    this.setState({
      currentIndex: index
    })
  };


  render () {
    const {currentIndex} = this.state;
    return (
      <View className='index'>
        {this.renderMain()}

        <WhiteSpace/>
        <AtTabBar
          fixed
          current={currentIndex}
          tabList={TAB_BAR_LIST}
          onClick={this.handleClickTab}/>
      </View>
    )
  }

  renderMain() {
    const {currentIndex} = this.state;
    console.log(currentIndex);
    let com: any = null;
    // 不是我傻，而是只能用 if else来写，taro sb
    if (currentIndex == 0) {
      com = <Home/>;
    } else if (currentIndex == 1) {
      com = <View>1</View>;
    } else if (currentIndex == 2) {
      com = <Add onCancel={()=>this.setState({currentIndex: 0})}/>;
    } else if (currentIndex == 3) {
      com = <View>3</View>;
    } else if (currentIndex == 4) {
      com = <Me/>;
    }
    return com;
  }
}
