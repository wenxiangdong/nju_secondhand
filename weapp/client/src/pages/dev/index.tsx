// @ts-ignore
import {AtButton} from "taro-ui";
import Taro from '@tarojs/taro';
import {View} from "@tarojs/components";
// import NjuTabBar from "../../components/nju-tab-bar";
import WhiteSpace from "../../components/common/white-space";

function Dev() {
  // noinspection JSIgnoredPromiseFromCall
  Taro.setNavigationBarTitle({title: '测试'});

  const handleClick = () => {

  };
  return (
    <View>
      {
        Array(30)
          .fill(0)
          .map((_, index) => (
            <View  key={index}  style={{marginTop: "10px"}}>
              <AtButton onClick={handleClick}>hello</AtButton>
            </View>
          ))
      }
      <WhiteSpace height={50}/>
      {/*<NjuTabBar/>*/}
    </View>
  )
}

Dev.config = {
  navigationBarTitleText: "试验"
};

export default Dev;
