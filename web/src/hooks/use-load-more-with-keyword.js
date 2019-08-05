import useLoadMore from "./use-load-more";
import {useEffect, useState} from "react";
interface IProp<T> {
    dataSource: (start: number, count: number, keyword: string) => Promise<T>;
    onSuccess?: (data: T) => void;
    onError?: (e: Error) => void;
}

/**
 * 分页加载，使用关键字搜索 逻辑
 * @param props
 * @returns {{data: *, setKeyword: *, loadData: *, setData: *}}
 */
export default function useLoadMoreWithKeyword(props: IProp) {

    const {dataSource, onError, onSuccess} = props;

    // states
    const [keyword, setKeyword] = useState("");

    // 柯里化
    const curry = () => (start, count) => {
        return dataSource(start, count, keyword);
    };
    let dataSourceCurry = curry();

    // 使用自定义hook
    const {data, loadData, reset, setData} = useLoadMore({
        onSuccess,
        onError,
        dataSource: dataSourceCurry
    });

    // effects
    /**
     * 关键词改变时，重置条件
     */
    useEffect( () => {
        dataSourceCurry = curry();
        reset();
    }, [keyword]);

    return {data, loadData, setKeyword, setData};
}