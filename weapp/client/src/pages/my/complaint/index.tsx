import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {ComplaintVO} from "../../../apis/ComplaintApi";
import {apiHub} from "../../../apis/ApiHub";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import LoadingPage from "../../../components/common/loading-page";
import {AtFab, AtIcon, AtLoadMore} from "taro-ui";
import {StyleHelper} from "../../../styles/style-helper";
import ComplaintCard from "../../../components/my/complaint-card";
import urlList from "../../../utils/url-list";

interface IState {
  loading: boolean,
  errMsg?: string,
  complaints: Array<ComplaintVO>,
  complaintsLoadMoreStatus?: 'more' | 'loading' | 'noMore',
}

/**
 * 订单反馈
 * @author 张李承
 * @create 2019/8/10 20:51
 */
export default class index extends Component<any, IState> {

  config: Config = {
    navigationBarTitleText: '反馈'
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      complaints: [],
    };
  }

  componentWillMount() {
    this.loadMoreHistoryComplaints();
  }

  private onLoadMoreHistoryComplaints = () => {
    this.setState({complaintsLoadMoreStatus: 'loading'},
      this.loadMoreHistoryComplaints);
  };

  private loadMoreHistoryComplaints = () => {
    const lastIndex = this.state.complaints.length;
    apiHub.complaintApi.getComplaints(lastIndex, 10)
      .then((complaints) => {
        if (complaints && complaints.length) {
          this.setState({loading: false, complaints: this.state.complaints.concat(complaints), complaintsLoadMoreStatus: 'more'});
        } else {
          this.setState({loading: false, complaintsLoadMoreStatus: 'noMore'});
        }
      })
      .catch(this.onError);
  };

  render() {
    const {
      loading, errMsg,
      complaints, complaintsLoadMoreStatus
    } = this.state;

    return loading || errMsg
      ? (
        <LoadingPage loadingMsg={errMsg}/>
      )
      : (
        <View>
          {complaints.map((c, idx) => <ComplaintCard key={idx} complaint={c}/>)}

          <AtLoadMore
            moreBtnStyle={StyleHelper.loadMoreBtnStyle}
            onClick={this.onLoadMoreHistoryComplaints}
            status={complaintsLoadMoreStatus}
          />

          <View style={{position: "fixed", bottom: "16px", right: "16px"}}>
            <AtFab onClick={() => Taro.navigateTo({url: urlList.MY_COMPLAINT_NEW})}>
              <AtIcon value='edit' />
            </AtFab>
          </View>
        </View>
      );
  }

  private onError = createSimpleErrorHandler('complaint', this);
}
