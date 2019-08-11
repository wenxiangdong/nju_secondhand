import Taro, {Component, Config} from '@tarojs/taro'
import {Location, MockUserApi} from "../../../apis/UserApi";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import {locationUrlConfig} from "../../../utils/url-list";
import DLocation from "../../../components/common/d-location/DLocation";

interface IState {
  loading: boolean,
  errMsg?: string,
  location?: Location
}

/**
 * 地图
 * @author 张李承
 * @create 2019/8/4 13:34
 */
export default class index extends Component<any, IState> {

  private readonly NOT_FIND_LOCATION_ERROR:Error = new Error('未找到该地点\n请重试');

  config: Config = {
    navigationBarTitleText: '地图'
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentWillMount() {
    this.getLocation()
      .then(location => this.setState({location, loading: false}))
      .catch(this.onError);
  }

  private getLocation = async (): Promise<Location> => {
    const location = locationUrlConfig.getLocation(this);
    if (location) {
      return new Promise<Location>(() => location);
    } else {
      throw this.NOT_FIND_LOCATION_ERROR;
    }
  };

  render() {
    const {location = MockUserApi.createMockLocation()} = this.state;

    return (
      <DLocation location={location}/>
    );
  }

  private onError = createSimpleErrorHandler('Buy', this);
}
