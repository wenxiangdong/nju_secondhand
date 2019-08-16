import Taro, {Config, useEffect, useState} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import {AtImagePicker, AtTextarea} from "taro-ui";
import {PostDTO} from "../../../apis/CircleApi";
import {sendPostUrlConfig} from "../../../utils/url-list";

/**
 * 发表
 * @create 2019/7/25 11:49
 */
export default function SendPost() {

  // state
  const [post, setPost] = useState({} as PostDTO);
  const [pictures, setPictures] = useState([] as {url: string}[]);

  // effect
  useEffect(() => {
    initPost();
  }, []);
  // methods
  const initPost = () => {
    const prePost = sendPostUrlConfig.getPrePost();
    prePost && setPost({...prePost});
  };

    return (
      <View>
        <AtTextarea
          customStyle={{border: "none"}}
          placeholder={"随便说点什么吧..."}
          value={post.desc}
          maxLength={400}
          onChange={event => setPost({...post, desc: event.detail.value})}
        />
        <AtImagePicker
          multiple
          files={pictures}
          onChange={files => setPictures(files)}
        />

      </View>
    );
}

SendPost.config = {
  navigationBarTitleText: "发表圈子"
} as Config;
