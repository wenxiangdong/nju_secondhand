import {httpMock, USE_MOCK} from "./base";
import type {HttpResponse} from "./http-response";

// models
export interface CategoryVO {
    _id: string;
    name: string;
    icon: string;
}
export interface GoodsVO {
    _id: string;
    sellerID: string;

    name: string;
    desc: string;
    price: string;
    pictures: Array<string>;
    category: CategoryVO;

    publishTime: number;

    state: number;
}


interface IGoodsApi {
    deleteGoods(goodID: string): Promise<void>;
    searchGoodsByKeyword(keyword: string, lastIndex: number, size?: number): Promise<GoodsVO[]>;
}

// implements
class MockGoodApi implements IGoodsApi {
    async deleteGoods(goodID: string) {
        return (await httpMock("", 2000));
    }
    async searchGoodsByKeyword(keyword: string, lastIndex: number, size?: number = 10) {
        const good: GoodsVO = {
            sellerID: "seller",
            name: "商品名称",
            desc: "描述描述描述描述描述描述描述描述描述描述描述描述描述描述描述",
            price: "10.50",
            pictures: ["https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=2429140882,3752935274&fm=26&gp=0.jpg",
                "https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=620114211,2321132725&fm=26&gp=0.jpg"],
            category: {
                    name: "分类",
                icon: ""
            },
            publishTime: +new Date(),
            state: 0
        };
        const response: HttpResponse = await httpMock(
            Array(size)
            .fill(null)
            .map((_, index) => (
                {...good, _id: Math.random(), name: good.name + index}
            ))
        );
        console.log(response);
        return response.data;
    }
}

let goodsApi: IGoodsApi;
if (USE_MOCK) {
    goodsApi = new MockGoodApi();
}
export default goodsApi;