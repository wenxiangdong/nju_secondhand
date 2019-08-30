import Taro, {Config, useEffect, useState} from "@tarojs/taro";
import {Picker, Text, View} from "@tarojs/components";
import {AtButton, AtForm, AtImagePicker, AtInput, AtTextarea, AtNoticebar, AtInputNumber} from "taro-ui";
import {CategoryVO, GoodsDTO} from "../../apis/GoodsApi";
import {CSSProperties} from "react";
import LoadingPage from "../../components/common/loading-page";
import {apiHub} from "../../apis/ApiHub";
import urlList, {resultUrlConfig} from "../../utils/url-list";
import WhiteSpace from "../../components/common/white-space";
const regeneratorRuntime = require("../../lib/async");

// export interface GoodsDTO {
//   name: string;
//   desc: string;
//   price: string;
//   pictures: Array<string>;
//   categoryID: string; // -> Category._id
// }

function Publish() {
  // states
  const [goods, setGoods] = useState({num: 1} as GoodsDTO);
  const [categories, setCategories] = useState([] as CategoryVO[]);
  const [selectedCateName, setCateName] = useState("");
  const [pictures, setPictures] = useState([]);
  const [loading, setLoading] = useState(true);
  // effects
  useEffect(() => {
    initCategories();
  }, []);
  // methods
  const initCategories = async () => {
    try {
      const res = await apiHub.goodsApi.getCategories();
      setCategories([...res]);
      setLoading(false);
    } catch (e) {
      Taro.showToast({
        title: "加载分类失败，请重试",
        icon: "none",
        complete: () => {
          Taro.navigateBack();
        }
      });
    }
  };
  const isFormValid = () => {
    return goods.name && goods.price && goods.desc && goods.categoryID;
  };
  const uploadFiles = (files: {url: string}[]) => {
    console.log("上传中", files);
    const CLOUD_DIR = "goods";
    const now = Date.now();
    // 上传文件
    return files.map(
      (p, index) => apiHub.fileApi.uploadFile(`${CLOUD_DIR}/${goods.name}/${now}/goods_${index}`, p.url)
    );
  };
  // handlers
  const handleChangeForm = (key: string, value: any) => {
    setGoods({
      ...goods,
      [key]: value
    });
  };
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const paths = await Promise.all(uploadFiles(pictures));
      console.log("上传文件成功", paths);
      goods.pictures = [...paths];
      await apiHub.goodsApi.publishGoods(goods);
      // 顺便发一条圈子
      apiHub.circleApi.publishPost({
        topic: "我有好货",
        desc: `宝贝【${goods.name}】，${goods.desc}，只需￥${goods.price}，赶快去首页搜索购买吧`,
        pictures: goods.pictures
      });
      resultUrlConfig.go({
        title: "发布商品成功",
        status: "success",
        link: urlList.MY_PUBLISH,
        tip: "去【我的发布】看看"
      });
    } catch (e) {
      Taro.showToast({
        icon: "none",
        title: "发布失败，请重试"
      });
    } finally {
      setLoading(false);
    }
  };
  // styles
  const commonStyles: CSSProperties = {
    width: "96vw",
    margin: "2vh 2vw 0 2vw",
    fontSize: "32rpx"
  };
  // components
  const form = (
    <AtForm onSubmit={handleSubmit}>
      <AtInput
        customStyle={{...commonStyles}}
        value={goods.name}
        name='name'
        title='商品名称'
        onChange={(value) => handleChangeForm("name", value.toString())}
      />
      <View style={{...commonStyles}}>商品描述</View>
      <AtTextarea
        customStyle={{width: "96vw", margin: "1vh 2vw"}}
        value={goods.desc}
        onChange={event => handleChangeForm("desc", event.detail.value)}
      />
      <Picker
        mode='selector'
        range={categories}
        rangeKey='name'
        onChange={event => {
          const index = event.detail.value;
          const category = categories[index];
          console.log("选中", category);
          category && handleChangeForm("categoryID", category._id);
          category && setCateName(category.name);
        }}
      >
        <AtInput
          title='商品类别'
          customStyle={{...commonStyles}}
          value={selectedCateName}
          name='category'
        />
      </Picker>
      <AtInput
        customStyle={{...commonStyles}}
        title='价格'
        type='digit'
        value={goods.price}
        onChange={value => handleChangeForm("price", value)}
      />
      {/*<AtInputNumber*/}
      {/*  type='number'*/}
      {/*  value={goods.num}*/}
      {/*  onChange={value => handleChangeForm("num", value)} />*/}
      <AtInput
        customStyle={{...commonStyles}}
        title='库存'
        type='number'
        name={"num"}
        value={goods.num}
        onChange={value => handleChangeForm("num", value)} />
      <View style={{...commonStyles}}>图片</View>
      <AtImagePicker
        files={pictures}
        onChange={(files) => setPictures([...files])}
      />
      <View style={{position: 'fixed', bottom: 0, width: '100vw', zIndex: 9}}>
        <AtButton
          type='primary'
          formType='submit'
          disabled={!isFormValid()}
        >提交商品信息</AtButton>
      </View>
    </AtForm>
  );
  const loadingPage = (
    <LoadingPage />
  );
  return (
    <View>
      <AtNoticebar>在平台发布的闲置物品卖出后，平台将收取其价格1%的费用（不足1元按1元计算）</AtNoticebar>
      {
        loading ? loadingPage : form
      }
      <WhiteSpace height={50} />
    </View>
  );
}

Publish.config = {
  navigationBarTitleText: "发布闲置"
} as Config;

export default Publish;
