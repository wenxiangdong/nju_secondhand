import {httpMock, USE_MOCK} from "./base";

export interface OrderVO {
    _id: string;
    buyerID: string;
    buyerName: string;

    sellerID: string;
    sellerName: string;

    goodsID: string;
    goodsName: string;
    goodsPrice: string;
    total: string;

    address: Location;

    orderTime: number;
    deliveryTime: number;

    state: number;
}

interface IOrderApi {
    // 订单管理
    getOrders(keyword: string, lastIndex: number, size: number): OrderVO[];
}

class MockOrderApi implements IOrderApi {
    async getOrders(keyword, lastIndex, size) {
        const order: OrderVO = {
            _id: Math.random(),
            buyerID: "buyer",
            buyerName: "buyerName",

            sellerID: "seller",
            sellerName: "sellerName",

            goodsID: "g",
            goodsName: "商品名称",
            goodsPrice: "10.05",
            total: "10.05",

            address: {
                    address: "地址"
            },

            orderTime: +new Date(),
            deliveryTime: +new Date(),

            state: 0,
        };
        await httpMock();
        return Array(size)
            .fill(undefined)
            .map((_, idx) => {
                return {
                    ...order,
                    _id: Math.random(),
                }
            });
    }
}

let orderApi: IOrderApi;
if (USE_MOCK) {
    orderApi = new MockOrderApi();
}
export default orderApi;