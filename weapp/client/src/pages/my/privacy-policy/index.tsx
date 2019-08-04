import Taro from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components'
import WhiteSpace from "../../../components/common/white-space";

function PrivacyPolicy() {
  return (
    <View className='at-article'>
      <View className='at-article__h1'>
        <Text>这是一级标题这是一级标题</Text>
      </View>
      <View className='at-article__info'>
        <Text decode space="nbsp">2017-05-07&nbsp;&nbsp;&nbsp;这是作者</Text>
      </View>
      <View className='at-article__content'>
        <View className='at-article__section'>
          <View className='at-article__h2'><Text>这是二级标题</Text></View>
          <View className='at-article__h3'><Text>这是三级标题</Text></View>
          <View className='at-article__p'>
            <Text>这是文本段落。这是文本段落。这是文本段落。这是文本段落。这是文本段落。这是文本段落。这是文本段落。这是文本落。这是文本段落。1234567890123456789012345678901234567890 ABCDEFGHIJKLMNOPQRSTUVWXYZ</Text>
          </View>
          <View className='at-article__p'>
            <Text>这是文本段落。这是文本段落。</Text>
          </View>
          <Image
            className='at-article__img'
            src='https://jdc.jd.com/img/400x400'
            mode='aspectFit' />
        </View>
      </View>
      <WhiteSpace/>
    </View>
  )
}

PrivacyPolicy.config = {
  navigationBarTitleText: "隐私权条款"
};

