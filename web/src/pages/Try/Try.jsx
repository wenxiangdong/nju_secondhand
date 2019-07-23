import React, {useEffect, useState} from "react";
import {Button, Input, Spin} from "antd";
import usePagination from "../../hooks/use-pagination";
import Logger from "../../utils/logger";
import usePaginationWithKeyword from "../../hooks/use-pagination-with-keyword";
import debounce from "../../utils/debounce";
import {Promise} from "q";

const logger = Logger.getLogger("Try");


const getData = async (index, offset, keyword) => {
    logger.info("getData", index, offset, keyword);
    await new Promise(r => setTimeout(r, 1000));
    return Array(offset).fill(keyword);
};

function Try() {

    const [loading, setLoading] = useState(false);
    // hooks
    const [data, loadMore ,setKeyword] = usePaginationWithKeyword({
        dataSource: (index, offset, keyword) => {
            setLoading(true);
            return getData(index, offset, keyword);
        },
        onSuccess: () => {
            setLoading(false);
        },
        onError: console.error
    });



    const handleChangeKeywordInput = debounce({
        fn: (e) => {
            logger.info(e.target.value);
            setKeyword(e.target.value);
        }
    });

    return (
        <div>
            <Input onChange={(e) => {e.persist(); handleChangeKeywordInput(e);}}/>
            <Button onClick={() => loadMore()}>hello</Button>
            <Spin spinning={loading}>
                {
                    data.map((item, index) => (
                        <div>{index + item}</div>
                    ))
                }
            </Spin>
        </div>
    );
}

export default Try;