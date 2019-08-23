import Taro, {Component} from '@tarojs/taro'
import {View, Text, Image} from '@tarojs/components'
import {AtAvatar, AtButton, AtForm, AtTextarea} from "taro-ui";
import {CSSProperties} from "react";
import {Comment, MockCircleApi, PostVO} from "../../../apis/CircleApi";
import {MockUserApi, UserVO} from "../../../apis/UserApi";
import urlList, {circlePostUrlConfig} from "../../../utils/url-list";
import {relaunchTimeout} from "../../../utils/date-util";
import {apiHub} from "../../../apis/ApiHub";
import localConfig from "../../../utils/local-config";
import LoadingPage from "../../../components/common/loading-page";
import ConfirmModal from "../../../components/common/confirm-modal";
import CommentCard from "../../../components/circle/comment-card";
import {createSimpleErrorHandler} from "../../../utils/function-factory";

function createStyles() {
  const baseView:CSSProperties = {
    display: "inline-flex",
    flexDirection: "column",
    width: '92vw',
    padding: '1vw 2vw',
    margin: '1vw 2vw',
  };
  const headerBar:CSSProperties = {
    display: "inline-flex",
    flexDirection: "row",
    width: '100%',
    height: '50px',
    alignItems: 'center',
    border: '1px solid transparent',
    borderBottomColor: 'lightgrey'
  };
  const topic:CSSProperties = {
    margin: '1vw 2vw',
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
  const form: CSSProperties = {
    border: '1px solid lightgrey transparent',
    margin: '1vw 0',
    padding: '1vw 0'
  };
  const comments:CSSProperties = {
    display: "inline-flex",
    flexDirection: "column",
    width: '100%',
    border: '1px solid transparent',
    borderTopColor: 'lightgrey',
    color: 'lightgrey'
  };
  return {
    baseView,
    headerBar,
    topic,
    desc,
    picture,
    form,
    comments,
  }
}

const styles = createStyles();

interface IState {
  loading: boolean,
  errMsg?: string,
  sucMsg?: string,
  post: PostVO,
  isCommenting: boolean,
  commentingLoading: boolean,
  user: UserVO,
  comment: string,
}

/**
 * index
 * @author 张李承
 * @create 2019/8/15 23:11
 */
export default class index extends Component<any, IState> {

  private readonly NOT_FIND_USER_ID_ERROR:Error = new Error('登录已失效');
  private readonly NOT_FIND_POST_ERROR:Error = new Error('这条圈子消息不见了\n请重试');

  private readonly defaultCommentState = {
    isCommenting: false,
    commentingLoading: false,
    errMsg: '',
    sucMsg: ''
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      post: MockCircleApi.createMockPost(),
      isCommenting: false,
      commentingLoading: false,
      user: MockUserApi.createMockUser(),
      comment: ''
    };
  }

  componentWillMount() {
    Promise.all([
      this.getPost(),
      this.getUserInfo()
    ]).then(([post, user])=> {
      this.setState({post, user, loading: false});
    }).catch(e => {
      this.onError(e);
      if (e === this.NOT_FIND_USER_ID_ERROR) {
        setTimeout(() => {
          Taro.reLaunch({
            url: urlList.LOGIN
          })
            .catch(this.onError);
        }, relaunchTimeout);
      }
    })
  }

  private getPost = async () => {
    let postId = circlePostUrlConfig.getCircleId(this);
    // postId = '1'; // TODO
    console.log("postId", postId);
    if (postId && postId.length) {
      return apiHub.circleApi.getPostById(postId);
    } else {
      throw this.NOT_FIND_POST_ERROR
    }
  };

  private getUserInfo = async () => {
    let userId = localConfig.getUserId();
    // userId = '1'; // TODO
    console.log("userId", userId);
    if (userId && userId.length) {
      return apiHub.userApi.getUserInfo(userId)
    } else {
      throw this.NOT_FIND_USER_ID_ERROR;
    }
  };

  private onSubmit = () => {
    this.setState({...this.defaultCommentState, isCommenting: true});
  };

  private handleCancel = () => {
    this.setState({...this.defaultCommentState});
  };

  private handleConfirm = () => {
    const that = this;
    this.setState({commentingLoading: true}, function () {
      const comment = that.state.comment;
      apiHub.circleApi.comment(that.state.post._id, comment)
        .then(function () {
          const newComment: Comment = { content: comment, commentTime: Date.now(), nickname: that.state.user.nickname};
          const sucMsg = '评论成功';
          const newPost:PostVO = JSON.parse(JSON.stringify(that.state.post));
          newPost.comments = [newComment].concat(that.state.post.comments);
          that.setState({sucMsg, commentingLoading: false, post: newPost, comment: ''}, function () {
            setTimeout(function () {
              that.setState({...that.defaultCommentState})
            }, relaunchTimeout);
          });
        })
        .catch(that.onError);
    });
  };

  private handleCommentChange = (event) => {
    this.setState({comment: event.target.value});
  };

  render() {
    const {
      loading, errMsg,
      post,
      comment,
      sucMsg, commentingLoading, isCommenting
    } = this.state;
    const { ownerName, topic, pictures, desc, comments = [], ownerAvatar } = post;

    return loading || errMsg
      ? (
        <LoadingPage loadingMsg={errMsg}/>
      )
      : (
      <View style={styles.baseView}>

        {
          isCommenting
            ? (
              <ConfirmModal loading={commentingLoading}
                            onCancel={this.handleCancel}
                            onConfirm={this.handleConfirm}
                            errMsg={errMsg}
                            sucMsg={sucMsg}
                            title="评论"
                            content={'您即将发布您的评论'}/>
            )
            : null
        }

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

        <AtForm
          customStyle={styles.form}
          onSubmit={this.onSubmit}
        >

          <AtTextarea
            maxLength={200}
            placeholder='评论（200字以内）'
            value={comment}
            onChange={this.handleCommentChange}
            autoFocus
            showConfirmBar
          />
          <AtButton type='primary' formType='submit' disabled={!comment}>提交评论</AtButton>
        </AtForm>

        <View style={styles.comments}>
          {comments.map((c, idx) => <CommentCard comment={c} key={idx}/>)}
        </View>
      </View>
    )
  }

  private onError = createSimpleErrorHandler('circlePost', this);
  config: Taro.Config = {
    navigationBarTitleText: "详情"
  };
}
