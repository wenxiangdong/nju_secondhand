import Taro, { Component, Config } from '@tarojs/taro'
import Index from './pages/index'

import './app.scss'

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
      'pages/circle/send-post/index',

      'pages/index/goods-info/index',

      'pages/login/index',

      'pages/message/index',

      'pages/my/index',
      'pages/my/my-bought/index',
      'pages/my/my-publish/index',
      'pages/my/my-sold/index',
      'pages/my/my-visited/index',
      'pages/my/platform-account/index',
      'pages/my/platform-rules/index',
      'pages/my/privacy-policy/index',
      'pages/my/software-license-agreement/index',
      'pages/my/user-info/index',

      'pages/register/index',
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: '南大小书童',
      navigationBarTextStyle: 'black'
    },
    cloud: true
  };

  componentDidMount () {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.cloud.init()
    }
  }

  componentDidShow () {}

  componentDidHide () {}

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
