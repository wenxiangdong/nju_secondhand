import Taro from '@tarojs/taro'
import {Image, Swiper, SwiperItem} from '@tarojs/components'

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
      autoplay>
      {
        srcs.map((src, idx) => (
          <SwiperItem key={`swiper-${idx}`}>
            <Image src={src} />
          </SwiperItem>
        ))
      }
    </Swiper>
  )
}

export default DSwiper;
