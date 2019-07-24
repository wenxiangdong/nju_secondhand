import React, {useEffect, useState} from "react";
import {Button, Input, Spin, Table} from "antd";
import useLoadMore from "../../hooks/use-load-more";
import Logger from "../../utils/logger";
import useLoadMoreWithKeyword from "../../hooks/use-load-more-with-keyword";
import debounce from "../../utils/debounce";
import DTable from "../../components/DTable/DTable";
import type {ColumnItem} from "../../components/DTable/DTable";
import InputWithDebounce from "../../components/InputWithDebounce/InputWithDebounce";

const logger = Logger.getLogger("Try");


const getData = async (index, offset, keyword) => {
    logger.info("getData", index, offset, keyword);
    await new Promise(r => setTimeout(r, 1000));
    return Array(offset).fill(keyword).map((item, index) => ({
        name: item,
        id: index,
        number: Math.random()
    }));
};

function Try() {
    // hooks
    const [data, loadMore ,setKeyword] = useLoadMoreWithKeyword({
        dataSource: (index, offset, keyword) => {
            return getData(index, offset, keyword);
        },
        onSuccess: () => {
        },
        onError: console.error
    });

    const columns: ColumnItem[] = [
        {
            title: "姓名",
            dataIndex: "name",
            key: "name",
            render: (item, index) => {
                return <a>{`${item.name}${index}`}</a>;
            }
        },
        {
            title: "编号",
            key: "id"
        },
        {
            title: "数字",
            dataIndex: "id",
            key: "number"
        },
        {
            title: "操作",
            key: "op",
            render: (row, index) => {
                return (
                    <Button onClick={() => console.log(row, index)}>hi</Button>
                );
            }
        }
    ];


    return (
        <div>
            <InputWithDebounce onChange={e => setKeyword(e.target.value)}/>
            {/*<Spin spinning={loading}>*/}
                <DTable
                    onLoad={loadMore}
                    columns={columns}
                    dataSet={data}/>
            {/*</Spin>*/}
        </div>
    );
}

export default Try;