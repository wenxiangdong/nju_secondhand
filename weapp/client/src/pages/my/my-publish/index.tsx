import Taro, {Component, Config} from '@tarojs/taro'
import {View} from '@tarojs/components'
import {GoodsVO} from "../../../apis/GoodsApi";
import {apiHub} from "../../../apis/ApiHub";
import {createSimpleErrorHandler} from "../../../utils/function-factory";
import LoadingPage from "../../../components/common/loading-page";
import ConfirmModal from "../../../components/common/confirm-modal";
import SoldGoodsCard from "../../../components/my/sold-goods-card";
import {RelaunchTimeout} from "../../../utils/date-util";

interface IState {
  loading: boolean,
  goodsArr: Array<GoodsVO>,
  isDelete: boolean,
  deleteLoading: boolean,
  errMsg?: string,
  sucMsg?: string,
  deleteIdx: number,
  atModalContent: string,
}

/**
 * index
 * @author 张李承
 * @create 2019/8/11 19:51
 */
export default class index extends Component<any, IState> {

  config: Config = {
    navigationBarTitleText: '我发布的'
  };

  private readonly defaultAtModalContent = '出错了，请取消操作';

  private readonly defaultDeleteState = {
    isDelete: false,
    deleteLoading: false,
    errMsg: undefined,
    sucMsg: undefined,
    deleteIdx: -1,
    atModalContent: this.defaultAtModalContent,
  };

  private cancelTimeout;

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      goodsArr: [],
      isDelete: false,
      deleteLoading: false,
      deleteIdx: -1,
      atModalContent: this.defaultAtModalContent,
    };
  }

  componentWillMount() {
    apiHub.goodsApi.getOngoingGoods()
      .then(goodsArr => {
        this.setState({goodsArr, loading: false});
      })
      .catch(this.onError);
  }

  private onDeleteGoods = (deleteIdx: number) => {
    const goods = this.state.goodsArr[deleteIdx];
    const atModalContent = `确认要下架商品吗\n商品名：${goods.name}\n此操作无法撤销`;
    this.setState({...this.defaultDeleteState, isDelete: true, deleteIdx, atModalContent})
  };

  private handleCancel = () => {
    this.setState({...this.defaultDeleteState});
    clearTimeout(this.cancelTimeout);
  };

  private handleConfirm = () => {
    const {deleteIdx} = this.state;
    const goods = this.state.goodsArr[this.state.deleteIdx];
    const {_id} = goods;
    const that = this;
    this.setState({deleteLoading: true}, function () {
      apiHub.goodsApi.deleteGoods(_id)
        .then(function() {
          console.log('delete success', _id);
          const goodsArr = that.state.goodsArr;
          const sucMsg = `商品名：${goods.name}\n已下架成功`;
          that.setState({sucMsg, deleteLoading: false, goodsArr: goodsArr.slice(0, deleteIdx).concat(goodsArr.slice(deleteIdx + 1))}, function() {
            that.cancelTimeout = setTimeout(() => that.setState({...that.defaultDeleteState}), RelaunchTimeout);
          });
        })
        .catch(that.onError)
      ;
    });
  };

  render() {
    const {
      loading, errMsg,
      goodsArr, isDelete, deleteLoading, sucMsg, atModalContent,
    } = this.state;

    return loading || errMsg
      ? (
        <LoadingPage errMsg={errMsg}/>
      )
      : (
        <View>

          {
            isDelete
              ? (
                <ConfirmModal loading={deleteLoading}
                              onCancel={this.handleCancel}
                              onConfirm={this.handleConfirm}
                              errMsg={errMsg}
                              sucMsg={sucMsg}
                              title="下架确认"
                              content={atModalContent}/>
              )
              : null
          }

          {goodsArr.map((g, idx) => <SoldGoodsCard key={idx} goods={g} onDeleteGoods={() => this.onDeleteGoods(idx)}/>)}

        </View>
      );
  }

  private onError = createSimpleErrorHandler('mySold', this);
}
