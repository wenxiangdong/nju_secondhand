import Taro, { Component, Config } from '@tarojs/taro'
import Index from './pages/index'

import './app.scss'
import messageHub from "./apis/MessageApi";
import {apiHub} from "./apis/ApiHub";
import {ConfigItem} from "./apis/Config";
import localConfig from "./utils/local-config";
import urlList from "./utils/url-list";


// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

class App extends Component {


  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    pages: [

      // 测试页面
      // 'pages/dev/index',
      'pages/index/index',

      'pages/circle/index',
      'pages/circle/post/index',
      'pages/circle/send-post/index',

      'pages/index/search-result/index',
      'pages/index/category-goods/index',
      'pages/index/goods-info/index',
      'pages/index/location/index',

      'pages/login/index',
      'pages/login/frozen_error/index',

      'pages/message/index',
      'pages/message/system/index',
      'pages/message/chat/index',

      'pages/my/index',
      'pages/my/my-bought/index',
      'pages/my/my-bought/send-complaint/index',
      'pages/my/my-publish/index',
      'pages/my/my-sold/index',
      'pages/my/my-visited/index',
      'pages/my/platform-account/index',
      'pages/my/platform-rules/index',
      'pages/my/privacy-policy/index',
      'pages/my/software-license-agreement/index',
      'pages/my/user-info/index',
      'pages/my/complaint/index',
      'pages/my/complaint/new-complaint/index',
      'pages/my/complaint/complaint-form/index',

      'pages/register/index',

      'pages/result/index',
      'pages/publish/index',

      'pages/user-info/index',

    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: '蓝鲸小书童',
      navigationBarTextStyle: 'black'
    },
    permission: {
      "scope.userLocation": {
        "desc": "你的位置信息将用于您分布的商品的参考信息"
      }
    },
    cloud: true
  };

  componentDidMount () {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.cloud.init()
    }
  }
  componentDidShow () {

  }

  componentDidHide () {
    if(messageHub.socketOpen()) {
      messageHub.closeWebsocket();
    }
  }

  componentDidCatchError () {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Index />
    )
  }
}

Taro.render(<App />, document.getElementById('app'));
