import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import MainTabBar from "../../components/common/main-tab-bar";
import SystemNotification from '../../components/message/system-notification';
import messageHub, { MessageVO } from '../../apis/MessageApi';
import MessageRow from '../../components/message/message-row';
import "./index.scss";
import { chatUrlConfig } from '../../utils/url-list';
import {apiHub} from "../../apis/ApiHub";

interface IState {
  conservationList: MessageVO[],
  avatarMap: Map<string, string>, // 存储聊天列表的用户头像
}

/**
 * 消息
 * @create 2019/7/25 11:49
 */
export class index extends Component<any, IState> {

  config: Config = {
    navigationBarTitleText: '消息'
  };

  state = {
    conservationList: [],
    avatarMap: new Map()
  };

  componentDidShow() {
    const list = messageHub.getLastMessageList();
    this.setState({
      conservationList: [...list]
    }, () => {
      this.loadUserInfo()
    });
  }

  loadUserInfo() {
    // 加载列表的头像信息
    const {conservationList, avatarMap} = this.state;
    conservationList.forEach((msg: MessageVO) => {
      const userID = msg.senderID || msg.receiverID;
      if (!avatarMap.get(userID)) {
        apiHub.userApi.getUserInfo(userID)
          .then(res => {
            avatarMap.set(userID, res.avatar);
            console.log(avatarMap);
            this.setState({
              avatarMap: avatarMap
            })
          });
      }
    })
  }

  handleClickConservation = (vo: MessageVO) => {
    const url = chatUrlConfig.createUrl(vo.senderID || vo.receiverID);
    console.log("url", url);
    Taro.navigateTo({
      url
    });
  };

  render() {
    const {conservationList, avatarMap} = this.state;
    return (
      <View>
        <View>
          <SystemNotification />
          <View className="message-list" >
            {
              conservationList.map((vo: MessageVO) => (
                <MessageRow
                  onClick={() => this.handleClickConservation(vo)}
                  avatar={avatarMap.get(vo.senderID || vo.receiverID)}
                  name={vo.senderName || vo.receiverName}
                  extra={this.parseMessage(vo.content)} />
              ))
            }
          </View>
        </View>
        <MainTabBar currentIndex={MainTabBar.MESSAGE_INDEX}/>
      </View>
    )
  }

  private parseMessage(content: string): string {
    if (content.startsWith("image://")) {
      return "图片";
    } else if (content.startsWith("text://")) {
      return content.replace("text://", "");
    } else {
      return content;
    }
  }
}
