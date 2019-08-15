import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {createSimpleErrorHandler} from "../../utils/function-factory";
import LoadingPage from "../../components/common/loading-page";
import {PostVO} from "../../apis/CircleApi";
import {apiHub} from "../../apis/ApiHub";
import {AtButton, AtLoadMore} from "taro-ui";
import {StyleHelper} from "../../styles/style-helper";
import PostCard from "../../components/circle/post-card/PostCard";
import urlList from "../../utils/url-list";

interface IState {
  loading: boolean,
  errMsg?: string,
  posts: PostVO[],
  loadMoreStatus?: 'more' | 'loading' | 'noMore',
}

/**
 * 圈子
 * @author 张李承
 * @create 2019/8/15 23:05
 */
export default class index extends Component<any, IState> {

  config: Config = {
    navigationBarTitleText: '圈子'
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      posts: [],
    };
  }

  componentWillMount() {
    this.setState({ loading: false, loadMoreStatus: 'loading'}, this.loadMorePosts);
  }

  private loadMorePosts = () => {
    const lastIndex = this.state.posts.length;
    apiHub.circleApi.getPosts(lastIndex)
      .then((posts) => {
        if (posts && posts.length) {
          this.setState({posts: this.state.posts.concat(posts), loadMoreStatus: 'more'});
        } else {
          this.setState({loadMoreStatus: 'noMore'});
        }
      })
      .catch(this.onError);
  };

  private onLoadMore = () => {
    this.setState({loadMoreStatus: 'loading'},
      this.loadMorePosts);
  };

  private handleSendPost = () => {
    Taro.navigateTo({ url: urlList.CIRCLE_SEND_POST })
      .catch(this.onError)
  };

  render() {
    const {
      loading, errMsg,
      posts,
      loadMoreStatus
    } = this.state;
    return (loading || errMsg)
      ? (
        <LoadingPage loadingMsg={errMsg}/>
      )
      : (
      <View>
        <AtButton type="primary" customStyle={{marginBottom: '2vw'}} onClick={this.handleSendPost}>发帖子</AtButton>
        {
          posts.map((p, idx) => <PostCard post={p} key={idx}/>)
        }
        <AtLoadMore
          moreBtnStyle={StyleHelper.loadMoreBtnStyle}
          onClick={this.onLoadMore}
          status={loadMoreStatus}
        />
      </View>
    )
  }

  private onError = createSimpleErrorHandler('circle', this);
}
