import Taro from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import {Comment, MockCircleApi} from "../../../apis/CircleApi";
import {timeToString} from "../../../utils/date-util";
import {CSSProperties} from "react";

function createStyles() {
  const baseView:CSSProperties = {
    display: "inline-flex",
    flexDirection: "column",
    width: '100%'
  };
  const content:CSSProperties = {
    margin: '1vw 2vw',
    wordBreak: "break-all",
  };
  const bottomBar:CSSProperties = {
    display: "inline-flex",
    fontSize: 'smaller',
    flexDirection: "row",
    width: '100%',
    height: '50px',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid transparent',
    borderBottomColor: 'lightgrey',
    color: 'lightgrey'
  };
  return {
    baseView,
    content,
    bottomBar
  }
}

const styles = createStyles();

interface IProp {
  comment: Comment
}

/**
 * CommentCard
 * @author 张李承
 * @create 2019/8/16 0:28
 */
function CommentCard(props: IProp) {
  const {comment = MockCircleApi.createMockComment()} = props;
  const {nickname, commentTime, content} = comment;
  return (
    <View style={styles.baseView}>
      <Text style={styles.content}>
        {content}
      </Text>
      <View style={styles.bottomBar}>
        <Text style={{marginLeft: '2vw'}}>
          {nickname}
        </Text>
        <Text style={{marginRight: '2vw'}}>
          {timeToString(commentTime)}
        </Text>
      </View>
    </View>
  )
}

export default CommentCard;
