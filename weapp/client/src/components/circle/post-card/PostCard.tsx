import Taro from '@tarojs/taro'
import {View, Text, Image, Button} from '@tarojs/components'
import {MockCircleApi, PostVO} from "../../../apis/CircleApi";
import {circlePostUrlConfig, indexSearchUrlConfig} from "../../../utils/url-list";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import {AtAvatar, AtIcon, AtButton} from "taro-ui";
import {timeToString} from "../../../utils/date-util";
import {CSSProperties} from "react";

interface IProp {
  post: PostVO
}

function createStyles() {
  const baseView:CSSProperties = {
    display: "inline-flex",
    flexDirection: "column",
    width: '92vw',
    padding: '1vw 2vw',
    margin: '1vw 2vw',
    border: '1px solid lightgrey',
    borderRadius: '5Px'
  };
  const headerBar:CSSProperties = {
    display: "inline-flex",
    flexDirection: "row",
    width: '100%',
    height: '50px',
    alignItems: 'center',
    border: '1px solid transparent',
    // borderBottomColor: 'lightgrey'
  };
  const topic:CSSProperties = {
    margin: '1vw 2vw',
    // fontSize: 'smaller',
    color: 'lightblue'
  };
  const desc:CSSProperties = {
    margin: '1vw 2vw',
    wordBreak: "break-all",
  };
  const picture:CSSProperties = {
    width: '28vw',
    height: '28vw',
    margin: '1vw'
  };
  const bottomBar:CSSProperties = {
    display: "inline-flex",
    flexDirection: "row",
    width: '100%',
    height: '50px',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid transparent',
    // borderTopColor: 'lightgrey',
    color: 'lightgrey'
  };
  const linkStyles: CSSProperties = {
    margin: '1vw',
    color: 'blue',
    textAlign: 'right',
  };
  return {
    baseView,
    headerBar,
    topic,
    desc,
    picture,
    bottomBar,
    linkStyles,
  }
}

const styles = createStyles();

const extractGoodsName = (post) => {
  const {topic, desc} = post;
  const reg = /宝贝【(.*?)】/;
  if (topic === '我有好货' && reg.test(desc)) {
    return RegExp.$1;
  }
  return '';
}

/**
 * PostCard
 * @author 张李承
 * @create 2019/8/15 23:12
 */
function PostCard(props: IProp) {
  const { post = MockCircleApi.createMockPost() } = props;
  const { ownerName, publishTime, topic, pictures, desc, comments = [], ownerAvatar } = post;
  const goodsName = extractGoodsName(post);
  const handleClickLink = (e) => {
    console.log(e);
    e.bubble = false;
    e.stopPropagation();
    Taro.navigateTo({
      url: indexSearchUrlConfig.createUrl(goodsName),
    });
  }

  const onError = createSimpleErrorHandler('PostCard', this);
  const navigateToPost = function (e) {
    e.stopPropagation();
    // return;
    Taro.navigateTo({
      url: circlePostUrlConfig.createUrl(post._id)
    })
      .catch(onError)
  };
  return (
    <View style={styles.baseView} onClick={navigateToPost}>
      <View style={styles.headerBar}>
        <AtAvatar image={ ownerAvatar } circle size={"small"} />
        <Text style={{marginLeft: '2vw'}}>{ ownerName }</Text>
      </View>
      {
        topic && topic.length
          ? (
            <Text style={styles.topic}>
              #{topic}#
            </Text>
          )
          : null

      }
      {
        desc && desc.length
          ? (
            <Text style={styles.desc}>
              {desc}
            </Text>
          )
          : null
      }
      {
        pictures && pictures.length
          ? (
            <View>
              {pictures.map((p, idx) => <Image src={p} key={idx} style={styles.picture} mode='aspectFill' />)}
            </View>
          )
          : null

      }
      {
        goodsName && (
        <View style={styles.linkStyles}>
          {/* <AtButton type='secondary' size='small' onClick={handleClickLink}>去看看</AtButton> */}
          <Button size='mini' plain style={{display: 'inline-block'}} onClick={handleClickLink}>去看看</Button>
        </View>)
      }
      <View style={styles.bottomBar}>
        <View style={{marginLeft: '2vw'}}>
          <AtIcon value='message' size='20' customStyle={{marginRight: '2vw'}}/> {comments.length}
        </View>
        <Text style={{marginRight: '2vw'}}>
          {timeToString(publishTime)}
        </Text>
      </View>
    </View>
  )
}

export default PostCard;
