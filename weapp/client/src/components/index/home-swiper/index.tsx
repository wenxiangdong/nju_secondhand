import Taro from '@tarojs/taro'
import {Swiper, SwiperItem} from '@tarojs/components'

interface IProp {
  srcs: Array<string>
}
/**
 * 主页的滚动视图
 */
function HomeSwiper(props:IProp) {
  const {srcs = ['', '', '']} = props;

  //TODO 添加滚动图片
  return (
    <Swiper
      indicatorColor='#999'
      indicatorActiveColor='#333'
      circular
      indicatorDots
      autoplay>
      {srcs.map((src, idx) => <SwiperItem key={`swiper-${idx}`} style={{backgroundImage: src}}/>)}
    </Swiper>
  )
}

export default HomeSwiper;
