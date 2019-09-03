import Taro, {Config, useEffect, useState} from '@tarojs/taro'
import {View, Text, Picker} from '@tarojs/components'
import {AtImagePicker, AtTextarea, AtInput, AtButton} from "taro-ui";
import {PostDTO} from "../../../apis/CircleApi";
import urlList, {resultUrlConfig, sendPostUrlConfig} from "../../../utils/url-list";
import {apiHub} from "../../../apis/ApiHub";
const regeneratorRuntime = require("../../../lib/async");

const TOPIC_LIST = ["买家秀", "好货在身边", "我想...", "前排求一个XXX"];

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
  const validPost = (post: PostDTO) => {
    return post.desc;
  };

  const uploadFiles = (files: {url: string}[]) => {
    console.log("上传中", files);
    const CLOUD_DIR = "post";
    const now = Date.now();
    // 上传文件
    return files.map(
      (p, index) => apiHub.fileApi.uploadFile(`${CLOUD_DIR}/${post.topic}/${now}/topic_${index}`, p.url)
    );
  };

  // handlers
  const handleClickSend = async () => {
    try {
      Taro.showLoading({
        title: "发表中..."
      });
      const paths = await Promise.all(uploadFiles(pictures));
      console.log("上传文件成功", paths);
      post.pictures = [...paths];
      await apiHub.circleApi.publishPost(post);
      resultUrlConfig.go({
        title: "发表成功",
        status: "success",
        tip: "到圈子去查看",
        link: urlList.CIRCLE
      });
    } catch (e) {
      console.error(e);
      Taro.showToast({
        title: "发表失败，请重试",
        icon: "none"
      });
    } finally {
      Taro.hideLoading();
    }
  };
    return (
      <View>
        <AtInput
          title='话题'
          name='topic'
          value={post.topic}
          placeholder='话题提高关注度哦'
          onChange={value => setPost({...post, topic: value.toString()})}
        >
          <Picker
            mode='selector'
            range={TOPIC_LIST}
            onChange={e => setPost({...post, topic: TOPIC_LIST[e.detail.value]})}
          >
            <Text>热门</Text>
          </Picker>
        </AtInput>
        <AtTextarea
          customStyle={{border: "none", padding: "24rpx"}}
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
        <View style={{
          position: "fixed",
          left: "0",
          right: "0",
          bottom: "0"
        }}
        >
          <AtButton
            type='primary'
            disabled={!validPost(post)}
            onClick={handleClickSend}
          >
            发表
          </AtButton>
        </View>
      </View>
    );
}

SendPost.config = {
  navigationBarTitleText: "发表圈子"
} as Config;
