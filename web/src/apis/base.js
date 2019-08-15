import type {HttpResponse} from "./http-response";
import Axios from "axios";
import Logger from "../utils/logger";
const logger = Logger.getLogger("http");

export const httpMock = async(data, timeout = 500): HttpResponse => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data,
                message: "",
                code: 0
            });
        }, timeout);
    })
};

export const http = {};
http.BASE_URL = "http://127.0.0.1:8080";
http.get = async (url, params) => {
    logger.info(url, params);
    const res = await Axios.get(http.BASE_URL + url, {
        params
    });
    logger.info(url, res);
    const data: HttpResponse = res.data;
    if (data.code !== 200) {
        throw data;
    }
    return data.data;
};

http.post = async (url, params) => {
    logger.info(url, params);
    const res = await Axios.post(http.BASE_URL + url, params);
    logger.info(url, res);
    const data: HttpResponse = res.data;
    if (data.code !== 200) {
        throw data;
    }
    return data.data;
};

export const USE_MOCK = true;