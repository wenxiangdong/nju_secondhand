import Taro from '@tarojs/taro'
import {View, Image} from '@tarojs/components'
import {GoodsVO, MockGoodsApi} from "../../../apis/GoodsApi";

import "taro-ui/dist/style/components/article.scss";
import "./index.scss"

interface IProp {
  goods: GoodsVO
}

/**
 * GoodsInfoCard
 * @author 张李承
 * @create 2019/8/4 9:23
 */
function GoodsInfoCard(props: IProp) {
  const {goods = MockGoodsApi.createMockGoods()} = props;
  const {pictures, desc} = goods;

  return (
    <View className='at-article'>
      <View className='at-article__content'>
        <View className='at-article__section'>
          {desc}
        </View>
        {pictures.map((p, idx) =>
          <Image
            onClick={() => Taro.previewImage({urls: pictures, current: p})}
            key={`goods-info-picture-${idx}-${p.substr(0, 20)}`}
                 className='at-article__img' src={p} mode='aspectFit' />)}
      </View>
    </View>
  )
}

export default GoodsInfoCard;
