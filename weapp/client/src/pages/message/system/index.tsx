import Taro, {Config} from "@tarojs/taro";
const regeneratorRuntime = require("../../../lib/async");
import LoadingPage from "../../../components/common/loading-page";
import {View} from "@tarojs/components";
import {NotificationVO} from "../../../apis/NotificationApi";
import MessageLeft from "../../../components/message/message-left";
import {apiHub} from "../../../apis/ApiHub";
import "../share.scss";

export default class System extends Taro.Component {
  state = {
    messageList: undefined
  };

  config: Config = {
    navigationBarTitleText: "系统通知",
    enablePullDownRefresh: true
  };


  async componentDidMount() {
    try {
      const vos = await apiHub.notificationApi.getNotifications(0, 10);
      this.setState({
        messageList: [...vos.sort((a, b) => a.time - b.time)]
      }, () => {
        Taro.pageScrollTo({
          scrollTop: Number.MAX_SAFE_INTEGER
        })
      });
    } catch (e) {
      console.error(e);
    }
  }

  async onPullDownRefresh() {
    let {messageList} = this.state;
    console.log("pull down");
    try {
      const res = await apiHub.notificationApi.getNotifications(
        (messageList || []).length
      );
      // @ts-ignore
      messageList = [...res, ...(messageList || [])];
      // @ts-ignore
      messageList = messageList.sort((a, b) => a.time - b.time);
      this.setState({
        messageList: [...messageList]
      }, () => {
        console.log(this.state.messageList);
      });
    } catch (e) {
    } finally {
      Taro.stopPullDownRefresh();
    }
  }

  render(): any {
    const {messageList} = this.state;
    const loadingPage = (<LoadingPage/>);
    const mainSection = (
      <View className={"Page__container"}>
        <View className={"PullDown__tip"}>下拉刷新</View>
        <View className={"MessageList__wrapper"}>
          {
            messageList && messageList.map((vo: NotificationVO) => (
              <MessageLeft content={vo.content} time={vo.time} />
            ))
          }
        </View>
      </View>
    );
    return (
      messageList ? mainSection : loadingPage
    );
  }
}

// export default function System() {
//   const [messageList, setMessageList] = useState(undefined);
//   // 加载数据
//   useEffect(() => {
//     (async () => {
//       try {
//         const vos = await apiHub.notificationApi.getNotifications(0);
//         // @ts-ignore
//         setMessageList([...vos]);
//       } catch (e) {
//         console.error(e);
//       }
//     })();
//   }, []);
//
//   const loadingPage = (<LoadingPage/>);
//   const mainSection = (
//     <View className={"Page__container"}>
//       <View className={"MessageList__wrapper"}>
//         {
//           messageList && messageList.map((vo: NotificationVO) => (
//             <MessageLeft content={vo.content}/>
//           ))
//         }
//       </View>
//     </View>
//   );
//   return (
//       messageList ? mainSection : loadingPage
//   );
// }
//
//
// System.config = {
//   navigationBarTitleText: "系统通知"
// };
