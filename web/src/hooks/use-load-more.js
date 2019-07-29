import {useState} from "react";
import Logger from "../utils/logger";

interface IProp<T> {
    dataSource: (start: number, count: number) => Promise<T>;
    onSuccess?: (data: T) => void;
    onError?: (e: Error) => void;
}

/**
 *
 * @param props
 * @returns {{data: *, setData: *, reset: *, loadData: *}}
 */
export default function useLoadMore<T>(props: IProp<T>) {
    // utils
    const logger = Logger.getLogger("use-pagination");
    // states
    const [data, setData] = useState([]);

    const COUNT = 10;

    // 加载更多数据
    async function loadData({reset = false} = {}) {
        logger.info("load more");
        const {dataSource, onSuccess, onError} = props;
        try {
            const res = await dataSource(data.length, COUNT);
            reset ? setData(res) : setData([...data, ...res]);
            onSuccess && onSuccess(res);
        } catch (e) {
            logger.error(e);
            onError && onError(e);
        }
    }

    // 清空
    function reset() {
        logger.info("reset");
        setData([]);
    }

    return {data, loadData, reset, setData};
}