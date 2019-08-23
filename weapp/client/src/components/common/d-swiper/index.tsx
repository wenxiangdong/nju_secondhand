import Taro from '@tarojs/taro'
import {Swiper, SwiperItem, Image} from '@tarojs/components'

interface IProp {
  srcs: Array<string>
}
/**
 * 主页的滚动视图
 */
function DSwiper(props:IProp) {
  const {srcs = []} = props;

  return (
    <Swiper
      indicatorColor='#999'
      indicatorActiveColor='#333'
      circular
      indicatorDots
      autoplay
    style={{height: "300rpx"}}>
      {srcs.map((src, idx) => (
        <SwiperItem key={`swiper-${idx}`}>
        <Image src={src} style={{width: "100%", height: "300rpx", margin: "auto"}} mode="aspectFill"/>
      </SwiperItem>))}
    </Swiper>
  )
}

export default DSwiper;
