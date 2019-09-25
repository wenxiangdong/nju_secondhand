import React from "react";
import useLoadMoreWithKeyword from "../../hooks/use-load-more-with-keyword";
import orderApi from "../../apis/order";
import {BackTop, message, Modal} from "antd";
import Logger from "../../utils/logger";
import type {ColumnItem} from "../../components/DTable/DTable";
import {DateUtil} from "../../utils/date";
import type {OrderVO} from "../../apis/order";
import type {GoodsVO} from "../../apis/goods";
import InputWithDebounce from "../../components/InputWithDebounce/InputWithDebounce";
import DTable from "../../components/DTable/DTable";
import {withAuth} from "../Login/Login";

const logger = Logger.getLogger("Order");

const dataSource = async (index, offset, keyword) => orderApi.getOrders(keyword, index, offset);

function Order() {

    // states
    const {data, loadData, setKeyword, setData} = useLoadMoreWithKeyword({
        dataSource,
        onError: (e) => {
            message.error("加载数据出错，请重试");
        },
        onSuccess: (res) => {
            logger.info(res);
        }
    });

    const handleClickCancle = (order: OrderVO) => {
        if (order.state !== 0) {
            alert("不能取消已经送达的订单");
        } else {
            Modal.warn({
                title: '取消订单',
                content: `你确定要取消订单【${order._id}】?`,
                maskClosable: true,
                onOk: async () => {
                    await orderApi.deleteOrder(order._id);
                    const idx = data.findIndex(item => item._id == order._id);
                    idx !== -1 && data.splice(idx, 1);
                    setData([...data]);
                    message.success("取消订单成功");
                }
            })
        }
    }

    const cols: ColumnItem[] = [
        {
            title: "编号",
            key: "_id"
        },
        {
            title: "卖家ID",
            key: "sellerID"
        },
        {
            title: "卖家昵称",
            key: "sellerName"
        },
        {
            title: "买家ID",
            key: "buyerID"
        },
        {
            title: "买家昵称",
            key: "buyerName"
        },
        {
            title: "商品ID",
            key: "goodsID"
        },
        {
            title: "商品名称",
            key: "goodsName"
        },
        {
            title: "下单时间",
            render: (vo: OrderVO) => DateUtil.format(vo.orderTime)
        },
        {
            title: "订单状态",
            render: (vo: OrderVO) => ['进行中', '已结束'][vo.state]
        },
        {
            title: "操作",
            render: (row: OrderVO) => {
                return (
                    <a onClick={() => handleClickCancle(row)}>取消</a>
                );
            }
        }

    ];

    return (
        <div className={"page"}>
            <InputWithDebounce onChange={e => setKeyword(e.target.value)} />
            <DTable columns={cols} dataSet={data} onLoad={loadData}/>
            <BackTop/>
        </div>
    );
}

export default withAuth(Order);