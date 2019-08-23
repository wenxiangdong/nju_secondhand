import Taro from '@tarojs/taro'
import {View, Text, Button} from '@tarojs/components'
import {AtActivityIndicator, AtModal, AtModalAction, AtModalContent, AtModalHeader} from "taro-ui";

interface IProp {
  loading: boolean,
  errMsg?: string,
  sucMsg?: string,
  onCancel: () => void,
  onConfirm: () => void,
  title: string,
  content: string,
}

/**
 * ConfirmModal
 * @author 张李承
 * @create 2019/8/10 22:48
 */
function ConfirmModal(props: IProp) {
  const {loading, errMsg, sucMsg, onCancel, onConfirm, title, content} = props;

  const loadingNode = (
    <View style={{position: 'relative', height: '100px'}}>
      <AtActivityIndicator content='加载中...' size={32} mode="center"/>
    </View>
  );

  const textNode = (
    <Text decode>
      {
        errMsg
          ? errMsg
          : (
            sucMsg
              ? sucMsg
              : content
          )
      }
    </Text>
  );

  const modalAction = (
    errMsg
      ? (
        <AtModalAction>
          <Button onClick={onCancel}>确定</Button>
        </AtModalAction>
      )
      : (
        <AtModalAction>
          <Button onClick={onCancel}>取消</Button>
          <Button onClick={onConfirm}>确定</Button>
        </AtModalAction>
      )
  );

  return (
    <AtModal isOpened
             closeOnClickOverlay={false}>
      <AtModalHeader>{errMsg? '出错了': title}</AtModalHeader>
      <AtModalContent>
        {
          loading && !errMsg
            ? loadingNode
            : (textNode)
        }
      </AtModalContent>
      {
        errMsg || (!(loading || sucMsg))
          ? (modalAction)
          : null
      }
    </AtModal>
  )
}

export default ConfirmModal;
