import InputWithDebounce from "../../components/InputWithDebounce/InputWithDebounce";
import React, {useState} from "react";
import Logger from "../../utils/logger";
import DTable from "../../components/DTable/DTable";
import type {ColumnItem} from "../../components/DTable/DTable";
import useLoadMoreWithKeyword from "../../hooks/use-load-more-with-keyword";
import goodsApi from "../../apis/goods";
import {BackTop, Button, Card, Divider, message, Modal} from "antd";
import type {GoodsVO} from "../../apis/goods";
import "./Goods.css";
import DImage from "../../components/DImage/DImage";
import {DateUtil} from "../../utils/date";
import {withAuth} from "../Login/Login";

const logger = Logger.getLogger("Goods");

/**
 * 数据源
 * @param index
 * @param count
 * @param keyword
 * @returns {Promise<GoodsVO[]>}
 */
const getGoods = (index, count, keyword) => {
    return goodsApi.searchGoodsByKeyword(keyword, index, count);
};

function Goods() {
    // inner components
    /**
     * 商品详情展示
     * @param vo
     * @returns {*}
     * @constructor
     */
    function GoodsDetailView(vo: GoodsVO = {}) {
        return (
            <Card className={"DetailView__wrapper"}
                  title={"商品详情"}
                  extra={<a onClick={() => setGoods(null)}>返回</a>}>
                <div className={"DetailView__item"}>
                    <span className={"DetailView__title"}>名称</span>
                    <span>：</span>
                    <span>{vo.name}</span>
                </div>
                <div className={"DetailView__item"}>
                    <span className={"DetailView__title"}>种类</span>
                    <span>：</span>
                    <span>{vo.category && vo.category.name}</span>
                </div>
                <div className={"DetailView__item"}>
                    <span className={"DetailView__title"}>卖家编号</span>
                    <span>：</span>
                    <span>{vo.sellerID}</span>
                </div>
                <div className={"DetailView__item"}>
                    <span className={"DetailView__title"}>价格</span>
                    <span>：</span>
                    <span>{vo.price}</span>
                </div>
                <div className={"DetailView__item"}>
                    <span className={"DetailView__title"}>描述</span>
                    <span>：</span>
                    <span>{vo.desc}</span>
                </div>
                <div className={"DetailView__item"}>
                    <span className={"DetailView__title"}>发布时间</span>
                    <span>：</span>
                    <span>{DateUtil.format(vo.publishTime)}</span>
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
            </Card>
        );
    }

    /**
     * 表格的每一列
     * @type {*[]}
     */
    const columns: ColumnItem[] = [
        {
            title: "编号",
            key: "_id"
        },
        {
            title: "卖家编号",
            key: "sellerID"
        },
        {
            title: "名称",
            key: "name"
        },
        {
            title: "价格",
            key: "price"
        },
        {
            title: "分类",
            key: "category",
            render: (row, index) => {
                return row.category && row.category.name;
            }
        },
        {
            title: "发布时间",
            key: "publishTime",
            render: (row) => DateUtil.format(row.publishTime)
        },
        {
            title: '库存',
            key: 'num',
        },
        {
            title: '状态',
            key: 'state',
            render: (row) => row.state === 0 ? '售卖中' : '下架'
        },
        {
            title: "操作",
            render: (row) => {
                return (
                    <div>
                        <a onClick={() => handleClickViewGood(row)}>详细</a>
                        <Divider type={"vertical"}/>
                        <a
                            style={{color: "tomato"}}
                            onClick={() => handleDeleteGoods(row)}>下架</a>
                    </div>
                );
            }
        }
    ];

    // states
    const {loadData, data, setKeyword, setData} = useLoadMoreWithKeyword({
        dataSource: getGoods,
        onSuccess: logger.info,
        onError: (e) => {
            logger.error(e);
            message.error(`加载数据出错，请重试`);
        }
    });
    const [selectedGoods, setGoods] = useState(null);

    // handlers
    const handleInputChange = (e) => {
        setKeyword(e.target.value);
    };
    const handleClickViewGood = (goods: GoodsVO) => {
        setGoods(goods);
    };
    const handleDeleteGoods = (vo: GoodsVO) => {
        logger.info("下架", vo);
        Modal.warn({
            title: "下架商品",
            content: `你确定要下架商品【${vo.name}】(${vo._id})？`,
            maskClosable: true,
            onOk: async () => {
                try {
                    await goodsApi.deleteGoods(vo._id);
                    const idx = data.findIndex(item => item._id == vo._id);
                    idx !== -1 && data.splice(idx, 1) && setData(data);
                    message.success("下架商品成功")
                } catch (e) {
                    logger.error(e);
                    message.error("下架商品出错：" + e.message);
                } finally {
                }
            }
        });

    };

    return (
        <div className={"page"}>
            {selectedGoods
                ? (
                    <GoodsDetailView {...selectedGoods} />
                )
                : (
                    <>
                        <InputWithDebounce onChange={handleInputChange}/>
                        <DTable columns={columns} dataSet={data} onLoad={loadData}/>
                    </>
                )
            }
            <BackTop/>
        </div>
    );
}

export default withAuth(Goods);