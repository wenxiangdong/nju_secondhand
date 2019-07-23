import {useState} from "react";
import Logger from "../utils/logger";

interface IProp<T> {
    dataSource: (start: number, count: number) => Promise<T>;
    onSuccess?: (data: T) => void;
    onError?: (e: Error) => void;
}

export default function usePagination<T>(props: IProp<T>) {
    // utils
    const logger = Logger.getLogger("use-pagination");
    // states
    const [data, setData] = useState([]);
    
    async function loadMore() {
        const {dataSource, onSuccess, onError} = props;
        try {
            const res = await dataSource();
            setData([...data, ...res]);
        } catch (e) {
            logger.error(e);
            onError && onError(e);
        }
    }

    return [data, loadMore];
}