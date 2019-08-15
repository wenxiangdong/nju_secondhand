import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text, ScrollView, Input} from '@tarojs/components'
import {chatUrlConfig} from "../../../utils/url-list";
import {apiHub} from "../../../apis/ApiHub";
import {UserVO} from "../../../apis/UserApi";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import LoadingPage from "../../../components/common/loading-page";
import messageHub, { MessageVO } from '../../../apis/MessageApi';
import "@tarojs/async-await";
import MessageLeft from '../../../components/message/message-left';
import MessageRight from '../../../components/message/message-right';
import "./index.scss";
import {AtIcon} from "taro-ui";

interface IState {
  loading: boolean,
  messageList: MessageVO[],
  errMsg?: string,
  sellerInfo?: UserVO,
  lastId: string,
  inputValue: string
}

/**
 * 聊天
 * @author 张李承
 * @create 2019/8/4 11:25
 */
export default class index extends Component<any, IState> {

  private readonly NOT_FIND_SELLER_ID_ERROR:Error = new Error('未找到卖家的信息请重试');

  config: Config = {
    navigationBarTitleText: '聊天'
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      messageList: [],
      lastId: "",
      inputValue: ""
    };
  }

  async componentWillMount() {
    const sellerId = chatUrlConfig.getUserId(this);
    try {
      if (sellerId && sellerId.length) {
        const messageList = messageHub.getMessageListByKey(sellerId);
        this.setState({
          messageList: [...messageList],
          lastId: `id-${messageList.length - 1}`
        });
        const sellerInfo = await apiHub.userApi.getUserInfo(sellerId);
        console.log(sellerInfo);
        Taro.setNavigationBarTitle({
          title: sellerInfo.nickname
        });
        this.setState({
          sellerInfo
        }, () => {
          this.initPreMessage();
        });
        messageHub.subscribe(this.handleReceiveNewMessage);
      } else {
        throw this.NOT_FIND_SELLER_ID_ERROR;
      }
    } catch (error) {
      console.error(error);
      this.onError(error);
    } finally {
      this.setState({
        loading: false
      })
    }
  }

  componentWillUnmount() {
    messageHub.unsubscribe(this.handleReceiveNewMessage);
  }

  initPreMessage() {
    const vo = chatUrlConfig.getPreMessage();
    vo && this.sendMessage(vo);
  }

  handleReceiveNewMessage = (vo: MessageVO) => {
    const {sellerInfo} = this.state;
    // 消息是该会话的
    if (sellerInfo && vo.senderID === sellerInfo._id) {
      this.setState(pre => ({
        messageList: [...pre.messageList, vo],
        lastId: `id-${pre.messageList.length}`
      }));
    }
  };

  render() {
    const {loading, errMsg, messageList, lastId, inputValue, sellerInfo} = this.state;

    const listSection = (
          messageList.map((message: MessageVO, idx) => (
            message.senderID
              ? <MessageLeft avatar={(sellerInfo && sellerInfo.avatar) || ""} key={idx} id={`id-${idx}`} name={message.senderName} content={message.content} time={message.time} />
              : <MessageRight key={idx} id={`id-${idx}`} content={message.content} time={message.time} />
          ))
    );

    return (loading || errMsg
      ? (
        <LoadingPage loadingMsg={errMsg} />
      )
      : (
        <View className='chat-page'>
          <ScrollView className='message-list'
            scrollIntoView={lastId}
            scrollY
          >
            {listSection}
          </ScrollView>
          <View className='bottom-bar'>
            <Input
              placeholder='输入消息'
              value={inputValue}
              onInput={e => {this.setState({inputValue: e.detail.value})}}
              className='input'
              confirmType='send'
              onConfirm={this.handleConfirmInput}
            />
            <AtIcon value='image' onClick={this.handleClickImageIcon} />
          </View>
        </View>
      )
    );
  }

  private onError = createSimpleErrorHandler('Chat', this);

  private handleConfirmInput = ({detail: {value}}) => {
    const {sellerInfo} = this.state;
    console.log(value);
    const vo: MessageVO = {
      content: "text://" + value,
      receiverID: sellerInfo && sellerInfo._id || "",
      receiverName: sellerInfo && sellerInfo.nickname || ""
    };
    this.sendMessage(vo);
    this.setState({
      inputValue: "",
      // messageList: [...pre.messageList, vo],
      // lastId: `id-${pre.messageList.length}`
    });
  };

  private handleClickImageIcon = async () => {
    const CLOUD_DIR = "chat/images/";
    const {sellerInfo} = this.state;
    try {
      const chooseRes = await Taro.chooseImage({
        count: 1,
      });
      const path = chooseRes.tempFilePaths[0];
      const url = await apiHub.fileApi.uploadFile(
        `${CLOUD_DIR}${+new Date()}`,
        path
      );
      const vo: MessageVO = {
        content: "image://" + url,
        receiverID: sellerInfo && sellerInfo._id || "",
        receiverName: sellerInfo && sellerInfo.nickname || ""
      };
      this.sendMessage(vo);

    } catch (error) {
      console.error(error);
      Taro.showToast({
        title: "选择图片失败",
        icon: "none"
      });
    }
  };

  private sendMessage = (vo: MessageVO) => {
    console.log("发送消息", vo);
    vo.time = +new Date();
    messageHub.sendMessage(vo);
    this.setState(pre => ({
      messageList: [...pre.messageList, vo],
      lastId: `id-${pre.messageList.length}`
    }));
  }
}
