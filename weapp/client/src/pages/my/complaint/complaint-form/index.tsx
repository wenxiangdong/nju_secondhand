import Taro, {useEffect, useState} from "@tarojs/taro";
import {ComplaintDTO} from "../../../../apis/ComplaintApi";
import {Text, View} from "@tarojs/components";
import {AtButton, AtForm, AtImagePicker, AtTextarea} from "taro-ui";
import {CSSProperties} from "react";
import {apiHub} from "../../../../apis/ApiHub";
import urlList, {complaintFormUrlConfig, resultUrlConfig} from "../../../../utils/url-list";

export default function ComplaintForm() {
  // states
  const [pictures, setPictures] = useState([] as any[]);
  const [complaint, setComplaint] = useState({} as ComplaintDTO);
  const [loading, setLoading] = useState(false);
  // styles
  const commonStyle: CSSProperties = {
    width: "96vw",
    margin: "2vh 2vw"
  };
  // effects
  useEffect(() => {
    initForm();
  }, []);
  // handlers
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const paths = await Promise.all(uploadFiles(pictures));
      console.log("上传文件成功", paths);
      complaint.pictures = [...paths];
      await apiHub.complaintApi.complain(complaint);
      // to result page
      resultUrlConfig.go({
        title: "提交投诉单成功",
        status: "success",
        tip: "回主页",
        link: urlList.INDEX
      });
    } catch (e) {
      Taro.showToast({
        icon: "none",
        title: "提交投诉失败，请重试"
      });
    } finally {
      setLoading(false);
    }
  };

  // methods
  const uploadFiles = (files: {url: string}[]) => {
    console.log("上传中", files);
    const CLOUD_DIR = "complaint";
    const now = Date.now();
    // 上传文件
    return files.map(
      (p, index) => apiHub.fileApi.uploadFile(`${CLOUD_DIR}/complaint_${now}_${index}`, p.url)
    );
  };

  const initForm = () => {
    let config = complaintFormUrlConfig.getConfig(this);
    setComplaint({...config});
  };

  return (
    <View>
      <AtForm onSubmit={handleSubmit}>
        <AtTextarea
          customStyle={commonStyle}
          placeholder={"写下你要反映的问题"}
          value={complaint.desc}
          onChange={event => setComplaint({...complaint, desc: event.detail.value})}
        />
        <View style={{...commonStyle}}><Text>添加图片可能会更好地反映问题</Text></View>
        <AtImagePicker files={pictures} onChange={files => setPictures(files)} />

        <View style={{position: 'fixed', bottom: 0, width: '100vw', zIndex: 9}}>
          <AtButton
            type='primary'
            formType='submit'
            disabled={!complaint.desc}
            loading={loading}
          >提交投诉单</AtButton>
        </View>
      </AtForm>
    </View>
  );
}
