import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import {chatUrlConfig} from "../../../utils/url-list";
import {apiHub} from "../../../apis/ApiHub";
import {UserVO} from "../../../apis/UserApi";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import LoadingPage from "../../../components/common/loading-page";

interface IState {
  loading: boolean,
  errMsg?: string,
  sellerInfo?: UserVO,
}

/**
 * 聊天
 * @author 张李承
 * @create 2019/8/4 11:25
 */
export default class index extends Component<any, IState> {

  private readonly NOT_FIND_SELLER_ID_ERROR:Error = new Error('未找到卖家的信息\n请重试');

  config: Config = {
    navigationBarTitleText: '聊天'
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentWillMount() {
    this.getSellerInfo()
      .then(sellerInfo => this.setState({sellerInfo, loading: false}))
      .catch(this.onError);
  }

  private getSellerInfo = async (): Promise<UserVO> => {
    const sellerId = chatUrlConfig.getUserId(this);
    if (sellerId && sellerId.length) {
      return apiHub.userApi.getUserInfo(sellerId);
    } else {
      throw this.NOT_FIND_SELLER_ID_ERROR;
    }
  };

  render() {
    const {loading, errMsg} = this.state;

    return (loading || errMsg
      ? (
        <LoadingPage loadingMsg={errMsg}/>
      )
      : (
        <View>
          <Text>Chat works</Text>
        </View>
      )
    );
  }

  private onError = createSimpleErrorHandler('Chat', this);
}
