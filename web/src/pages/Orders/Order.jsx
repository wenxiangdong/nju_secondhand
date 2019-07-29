import React from "react";
import useLoadMoreWithKeyword from "../../hooks/use-load-more-with-keyword";
import orderApi from "../../apis/order";
import {BackTop, message} from "antd";
import Logger from "../../utils/logger";
import type {ColumnItem} from "../../components/DTable/DTable";
import {DateUtil} from "../../utils/date";
import type {OrderVO} from "../../apis/order";
import type {GoodsVO} from "../../apis/goods";
import InputWithDebounce from "../../components/InputWithDebounce/InputWithDebounce";
import DTable from "../../components/DTable/DTable";

const logger = Logger.getLogger("Order");

const dataSource = async (index, offset, keyword) => orderApi.getOrders(keyword, index, offset);

function Order() {

    // states
    const {data, loadData, setKeyword} = useLoadMoreWithKeyword({
        dataSource,
        onError: (e) => {
            message.error("加载数据出错，请重试");
        },
        onSuccess: (res) => {
            logger.info(res);
        }
    });

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
            render: (vo: OrderVO) => vo.state
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

export default Order;