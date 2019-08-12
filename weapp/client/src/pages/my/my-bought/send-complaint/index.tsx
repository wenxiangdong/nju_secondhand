import Taro, {Component, Config} from '@tarojs/taro'
import "@tarojs/async-await";
import {View} from '@tarojs/components'
import {MockOrderApi, OrderVO} from "../../../../apis/OrderApi";
import {apiHub} from "../../../../apis/ApiHub";
import {createSimpleErrorHandler} from "../../../../utils/function-factory";
import BoughtOrderCard from "../../../../components/my/bought-order-card";
import LoadingPage from "../../../../components/common/loading-page";
import {AtButton, AtForm, AtImagePicker, AtTextarea} from "taro-ui";
import WhiteSpace from "../../../../components/common/white-space";
import urlList, {sendComplaintUrlConfig} from "../../../../utils/url-list";
import {relaunchTimeout} from "../../../../utils/date-util";

interface FileItem {
  path: string

  size: number
}

interface Picture {
  url: string

  file?: FileItem
}

interface IState {
  loading: boolean,
  errMsg?: string,
  sucMsg?: string,
  order: OrderVO,
  desc: string,
  pictures: Array<Picture>
}

/**
 * index
 * @author 张李承
 * @create 2019/8/11 10:35
 */
export default class index extends Component<any, IState> {

  private readonly NOT_FIND_ORDER_ID_ERROR:Error = new Error('未找到订单信息\n请重试');

  private readonly DEFAULT_COMPLAINT_INFO = {
    desc: '',
    pictures: [],
  };

  config: Config = {
    navigationBarTitleText: '反馈'
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      order: MockOrderApi.createMockOrder(),
      ...this.DEFAULT_COMPLAINT_INFO
    };
  }

  componentWillMount() {
    this.initOrder()
      .then(order => this.setState({loading: false, order: order}))
      .catch(this.onError);
  }

  private initOrder = async (): Promise<OrderVO> => {
    const orderId = sendComplaintUrlConfig.getOrderId(this);
    if (orderId && orderId.length) {
      return apiHub.orderApi.getOrderById(orderId);
    } else {
      throw this.NOT_FIND_ORDER_ID_ERROR;
    }
  };

  private handleDescChange = (event) => {
    const desc = event.target.value;
    this.setState({desc});
    return desc;
  };

  private handlePictureChange = (pictures) => {
    this.setState({pictures});
  };

  private handleErrMsg = (errMsg) => {
    Taro.atMessage({
      message: errMsg,
      type: 'error'
    });
  };

  private createComplaintPicturesUrl = () => {
    return `complaint/${this.state.order._id}/${Date.now()}`;
  };

  private onSubmit = () => {
    const that = this;
    this.setState({loading: true}, function () {
      const {pictures, desc, order} = that.state;
      const picturesCount = pictures.length;
      let uploadedFiles: Array<string> = [];

      const handleErr = function (errMsg, e) {
        console.error(e);
        apiHub.fileApi.deleteFile(uploadedFiles)
          .then(() => {
            that.setState({loading: false});
            that.handleErrMsg(errMsg);
          })
          .catch(that.onError);
      };

      const uploadPictures = async function () {
        let idx;
        let pic;
        let filePath;
        for (idx = 0; idx < picturesCount; idx++) {
          pic = pictures[idx];
          filePath = await apiHub.fileApi.uploadFile(
            that.createComplaintPicturesUrl(),
            pic.url
          );
          uploadedFiles.push(filePath);
        }
      };

      const sendComplaint = function () {
        apiHub.complaintApi.complain({
          orderID: order._id,
          desc,
          pictures: uploadedFiles
        })
          .then(() => {
            that.setState({sucMsg: '上传反馈成功'},
              function () {
                setTimeout(function () {
                  Taro.reLaunch({url: urlList.MY}).catch(that.onError);
                },  relaunchTimeout);
              }
            );
          })
          .catch(e => handleErr('上传反馈失败，请稍后重试', e))
      };

      uploadPictures()
        .then(sendComplaint)
        .catch(e => handleErr('上传图片失败，请稍后重试', e));
    })
  };

  private onReset = () => {
    this.setState({...this.DEFAULT_COMPLAINT_INFO});
  };

  render() {
    const {
      loading, errMsg,
      sucMsg,
      order,
      pictures, desc
    } = this.state;

    return loading || errMsg || sucMsg
      ? (
        <LoadingPage errMsg={errMsg || sucMsg}/>
      )
      : (
      <View>
        <BoughtOrderCard order={order} isBuyer={true} isComplaint={true}/>
        <AtForm
          onSubmit={this.onSubmit}
          onReset={this.onReset}
        >
          <AtTextarea
            customStyle={{margin: '1vw 2vw', width: '96vw'}}
            value={desc}
            onChange={this.handleDescChange}
            maxLength={200}
            placeholder='你的反馈是...（200字以内）'
          />
          <AtImagePicker
            files={pictures}
            multiple={true}
            length={3}
            onChange={this.handlePictureChange}
            onFail={this.handleErrMsg}
          />
          <WhiteSpace height={80}/>
          <View style={{position: 'fixed', bottom: 0, width: '100vw', zIndex: 9}}>
            <AtButton type='primary' formType='submit' disabled={!desc.length}>提交反馈</AtButton>
            <AtButton type='secondary' formType='reset'>重置反馈</AtButton>
          </View>
        </AtForm>
      </View>
    )
  }

  private onError = createSimpleErrorHandler('sendComplaint', this);
}
