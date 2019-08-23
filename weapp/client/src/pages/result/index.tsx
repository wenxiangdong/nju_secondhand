import Taro from "@tarojs/taro";
import {Text, View} from "@tarojs/components";
import {AtButton, AtCard, AtIcon} from "taro-ui";
import WhiteSpace from "../../components/common/white-space";
import urlList from "../../utils/url-list";

const DEFAULT_STATE: ResultProp = {
  title: "成功",
  status: "success",
  link: urlList.INDEX,
  tip: "回主页"
};
export interface ResultProp {
  title: string,
  status: "success" | "warn",
  link?: string,
  tip?: string
}
export default class Result extends Taro.Component {
  state = {
    ...DEFAULT_STATE
  };
  private ICON_SIZE = 64;

  componentDidMount(): void {
    const params = this.$router.params;
    this.setState({
      ...DEFAULT_STATE,
      ...params
    });
  }

  render(): any {
    const {title, status, link, tip} = this.state;
    return (
      <View style={{
        marginTop: "16px"
      }}>
        <AtCard>
          <View style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%"
          }}>
            {
              status === "success"
                ? <AtIcon value='check-circle' color='#13CE66' size={this.ICON_SIZE}/>
                : <AtIcon value='alert-circle' color='#FFC82C' size={this.ICON_SIZE}/>
            }
            <View className='at-article__h3'><Text>{title}</Text></View>
            <WhiteSpace height={16} />
            {
              link
                ? (
                  <AtButton
                    type='secondary'
                    size='small'
                    full
                    onClick={() => Taro.redirectTo({url: link})}
                  >
                    {tip}
                  </AtButton>
                )
                : null
            }
          </View>
        </AtCard>
      </View>
    );
  }
}
