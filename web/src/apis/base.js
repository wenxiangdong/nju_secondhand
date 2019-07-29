import type {HttpResponse} from "./http-response";

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

export const USE_MOCK = true;