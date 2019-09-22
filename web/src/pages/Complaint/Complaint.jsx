import React, {useEffect, useState} from "react";
import useLoadMoreWithKeyword from "../../hooks/use-load-more-with-keyword";
import complaintApi from "../../apis/complaint";
import {BackTop, Card, Divider, Input, message, Modal} from "antd";
import Logger from "../../utils/logger";
import type {ComplaintVO} from "../../apis/complaint";
import {DateUtil} from "../../utils/date";
import DImage from "../../components/DImage/DImage";
import InputWithDebounce from "../../components/InputWithDebounce/InputWithDebounce";
import DTable from "../../components/DTable/DTable";
import type {ColumnItem} from "../../components/DTable/DTable";
import {withAuth} from "../Login/Login";

const logger = Logger.getLogger("Complaint");

const dataSource = async (index, offset, keyword) => {
    return complaintApi.getComplaints(keyword, index, offset);
};

const STATES = ["待处理", "已处理"];

function Complaint() {
    // components
    function DetailView(vo: ComplaintVO = {}) {
        return (<Card className={"DetailView__wrapper"}
              title={"投诉详情"}
              extra={<a onClick={() => setComplaint(null)}>返回</a>}>
            <div className={"DetailView__item"}>
                <span className={"DetailView__title"}>编号</span>
                <span>：</span>
                <span>{vo._id}</span>
            </div>
            <div className={"DetailView__item"}>
                <span className={"DetailView__title"}>状态</span>
                <span>：</span>
                <span>{STATES[vo.state]}</span>
            </div>
            <div className={"DetailView__item"}>
                <span className={"DetailView__title"}>创建时间</span>
                <span>：</span>
                <span>{DateUtil.format(vo.complainTime)}</span>
            </div>
            <div className={"DetailView__item"}>
                <span className={"DetailView__title"}>投诉人ID</span>
                <span>：</span>
                <span>{vo.complainantID}</span>
            </div>
            <div className={"DetailView__item"}>
                <span className={"DetailView__title"}>投诉人昵称</span>
                <span>：</span>
                <span>{vo.complainantName}</span>
            </div>
            <div className={"DetailView__item"}>
                <span className={"DetailView__title"}>内容</span>
                <span>：</span>
                <span>{vo.desc}</span>
            </div>
            <div className={"DetailView__item"}>
                <span className={"DetailView__title"}>图片</span>
                <span>：</span>
                <div className={"DetailView__pictures"}>
                    {vo.pictures.map(pic => (
                        <DImage key={pic} image={pic}/>
                    ))}
                </div>
            </div>
            {
                vo.handling
                    ? (
                        <div className={"DetailView__item"}>
                            <span className={"DetailView__title"}>处理结果</span>
                            <span>：</span>
                            <div>
                                <div>{vo.handling.result}</div>
                                <div>{DateUtil.format(vo.handling.time)}</div>
                            </div>
                        </div>
                    )
                    : null
            }
        </Card>);
    }

    // cols
    const columns: ColumnItem[] = [
        {
            title: "编号",
            key: "_id"
        },
        {
            title: "时间",
            key: "complainTime",
            render: (row) => DateUtil.format(row.complainTime)
        },
        {
            title: "投诉人ID",
            key: "complainantID"
        },
        {
            title: "投诉人昵称",
            key: "complainantName"
        },
        {
            title: "状态",
            key: "state",
            render: (row) => {
                return STATES[row.state];
            }
        },
        {
            title: "内容",
            key: "desc",
            render: (row) => row.desc.substring(0, 10) + "..."
        },
        {
            title: "操作",
            render: (row) => {
                const detailBtn = (
                    <a onClick={() => setComplaint(row)}>详情</a>
                );
                if (row.handling) {
                    return detailBtn;
                } else {
                    const handleBtn = (
                        <a onClick={() => handleHandle(row)}>处理</a>
                    );
                    return (
                        <div>
                            {detailBtn}
                            <Divider type={"vertical"}/>
                            {handleBtn}
                        </div>
                    );
                }
            }
        }
    ];
    
    // states
    const {data, loadData, setData, setKeyword} = useLoadMoreWithKeyword({
        dataSource: dataSource,
        onSuccess: logger.info,
        onError: (e) => {
            logger.error(e);
            message.error(`加载数据出错，请重试`);
        }
    });
    const [selectedComplaint, setComplaint] = useState(null);

    // handlers
    const handleHandle = async (vo: ComplaintVO) => {
      const result = prompt("请输入处理意见", "未填写");
      if (!result) return;
      const hide = message.loading("操作中...");
      try {
          await complaintApi.handle(vo._id, result);
          message.success("成功");
          const index = data.findIndex(item => item._id === vo._id);
          index !== -1
            && (data[index].handling = {result, time: +new Date()})
            && setData([...data]);
      } catch (e) {
          message.error("操作失败：" + e.message);
      } finally {
          hide();
      }
    };

    // elements
    const detailSection = setComplaint ? <DetailView {...selectedComplaint} /> : null;
    const mainSection = (
        <>
            <InputWithDebounce onChange={e => setKeyword(e.target.value)}/>
            <DTable columns={columns} dataSet={data} onLoad={loadData}/>
        </>
    );


    return (
        <div className={"page"}>
            {selectedComplaint ? detailSection : mainSection}
            <BackTop/>
        </div>
    );
}


export default withAuth(Complaint);