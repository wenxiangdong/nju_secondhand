import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {createSimpleErrorHandler} from "../../utils/function-factory";
import LoadingPage from "../../components/common/loading-page";
import {PostVO} from "../../apis/CircleApi";
import {apiHub} from "../../apis/ApiHub";
import {AtLoadMore, AtFab, AtIcon, AtSearchBar} from "taro-ui";
import {StyleHelper} from "../../styles/style-helper";
import PostCard from "../../components/circle/post-card/PostCard";
import urlList from "../../utils/url-list";
import MainTabBar from "../../components/common/main-tab-bar";

interface IState {
  errMsg?: string,
  posts: PostVO[],
  loadMoreStatus?: 'more' | 'loading' | 'noMore',
  searchDisabled: boolean,
  searchValue: string,
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

  private beforeSearchValue: string = '';

  constructor(props) {
    super(props);
    this.state = {
      posts: [],
      searchValue: '',
      searchDisabled: true,
      loadMoreStatus: 'loading',
    };
  }

  componentWillMount() {
    this.loadMorePosts();
  }

  private loadMorePosts = () => {
    const lastIndex = this.state.posts.length;
    apiHub.circleApi.searchPostsByKeyword(this.state.searchValue || '', lastIndex)
      .then((posts) => {
        if (posts && posts.length) {
          this.setState({searchDisabled: false, posts: this.state.posts.concat(posts), loadMoreStatus: 'more'});
        } else {
          this.setState({searchDisabled: false, loadMoreStatus: 'noMore'});
        }
      })
      .catch(this.onError);
  };

  private search = () => {
    if (this.state.searchValue !== this.beforeSearchValue) {
      this.setState({posts: []}, this.onLoadMore);
    } else {
      this.onLoadMore();
    }
  };

  private onLoadMore = () => {
    this.setState({loadMoreStatus: 'loading', searchDisabled: true},
      this.loadMorePosts);
  };

  private handleSendPost = () => {
    Taro.navigateTo({ url: urlList.CIRCLE_SEND_POST })
      .catch(this.onError)
  };

  render() {
    const {
      errMsg,
      posts,
      loadMoreStatus,
      searchDisabled, searchValue
    } = this.state;
    return (errMsg)
      ? (
        <LoadingPage loadingMsg={errMsg}/>
      )
      : (
      <View>
        <AtSearchBar
          placeholder='请输入关键词搜索'
          disabled={searchDisabled}
          maxLength={20}
          value={searchValue}
          onChange={(searchValue) => this.setState({searchValue})}
          onActionClick={this.search}
          onConfirm={this.search}
        />
        {
          posts.map((p, idx) => <PostCard post={p} key={idx}/>)
        }
        <AtLoadMore
          moreBtnStyle={StyleHelper.loadMoreBtnStyle}
          onClick={this.onLoadMore}
          status={loadMoreStatus}
        />
        <View style={{position: "fixed", right: "16px", bottom: "140rpx"}}>
          <AtFab size='small' onClick={this.handleSendPost}>
            <AtIcon value='edit' />
          </AtFab>
        </View>
        <MainTabBar currentIndex={1} />
      </View>
    )
  }

  private onError = createSimpleErrorHandler('circle', this);
}
