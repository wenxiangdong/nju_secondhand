import Taro, {Component, Config} from '@tarojs/taro'
import {View, Text} from '@tarojs/components'
import MainTabBar from "../../components/common/main-tab-bar";
import SystemNotification from '../../components/message/system-notification';
import messageHub, { MessageVO } from '../../apis/MessageApi';
import MessageRow from '../../components/message/message-row';
import "./index.scss";
import { chatUrlConfig } from '../../utils/url-list';

interface IState {
  conservationList: MessageVO[]
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
    conservationList: []
  };

  componentDidShow() {
    const list = messageHub.getLastMessageList();
    this.setState({
      conservationList: [...list]
    });
  }

  handleClickConservation = (vo: MessageVO) => {
    const url = chatUrlConfig.createUrl(vo.senderID || vo.receiverID);
    console.log("url", url);
    Taro.navigateTo({
      url
    });
  }

  render() {
    const {conservationList} = this.state;
    return (
      <View>
        <View>
          <SystemNotification />
          <View className="message-list">
            {
              conservationList.map((vo: MessageVO) => (
                <MessageRow 
                  onClick={() => this.handleClickConservation(vo)}
                  name={vo.senderName} 
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
