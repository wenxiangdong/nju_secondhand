import Taro, {useEffect} from "@tarojs/taro";
import {View} from "@tarojs/components";


function Home() {
  // effects
  /**
   * 设置标题
   */
  useEffect(() => {
    // noinspection JSIgnoredPromiseFromCall
    Taro.setNavigationBarTitle({
      title: "首页"
    })
  }, []);
  console.log("home");
  return (
    <View>Home</View>
  )
}

export default Home;
