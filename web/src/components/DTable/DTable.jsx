import React, {ReactNode, useState} from "react";
import "./DTable.css";
import {Button} from "antd";
import Logger from "../../utils/logger";

const logger = Logger.getLogger("DTable");

export interface ColumnItem {
    title: string;
    key: string;
    render: any => ReactNode
}
interface IProp {
    columns: ColumnItem[],
    dataSet: any[],
    onLoad: () => Promise<any>
}
export default function DTable({columns = [], dataSet = [], onLoad}: IProp = {}) {


    // states
    const [loading, setLoading] = useState(false);

    /**
     * 表格头部
     */
    const header = (
        <thead className={"DTable__head DTable__row"}>
        {
            columns.map((col: ColumnItem) => (
                <th key={col.title}>{col.title}</th>
            ))
        }
        </thead>
    );

    /**
     * 表格主体
     */
    const body = (
        <tbody className={"DTable__body"}>
        {
            dataSet.map((row, index) => (
                <tr key={index} className={"DTable__row"}>
                    {
                        /**
                         * 构造每一项
                         */
                        columns.map((col: ColumnItem) => {
                            let content = row[col.key];
                            // 是否有自定义render
                            if (col.render) {
                                content = col.render(row, index);
                            }
                            return <td key={col.key} className={"DTable__item"}>{content}</td>;
                        })
                    }
                </tr>
            ))
        }
        </tbody>
    );

    const handleClickLoad = async () => {
        try {
            setLoading(true);
            await onLoad();
        } catch (e) {
            logger.error(e);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className={"DTable__container"}>
            <table className={"DTable__table"}>
                {header}
                {body}
            </table>
            <div className={"DTable__footer"}>
                <Button
                    type={"link"}
                    loading={loading}
                    onClick={handleClickLoad}
                    icon={loading ? "loading" : "down-circle"}>
                    {loading ? "加载中" : "加载更多"}
                </Button>
            </div>
        </div>
    );
}