import {httpMock, USE_MOCK} from "./base";

export interface ComplaintVO {
    _id: string;
    orderID: string; // 订单编号
    desc: string,

    complainantID: string;
    complainantName: string;

    pictures: Array<string>;

    complainTime: number;

    handling: Handling | null;

    state: number;
}

export interface Handling {
    time: number,
    result: string
}

// enum ComplaintState {
//     Ongoing,
//         Handled
// }

interface IComplaintApi {
    // 投诉管理
    getComplaints(keyword: string, lastIndex: number, size: number): Promise<ComplaintVO[]>;

    handle(complaintID: string, result: string): Promise;
}

class MockComplaintApi implements IComplaintApi {
    async getComplaints(keyword, lastIndex, size) {
        const vo: ComplaintVO = {
            _id: "",
            orderID: "order", // 订单编号
            desc: "投诉投诉投诉投诉投诉投诉投诉投诉投诉投诉投诉投诉投诉投诉投诉投诉投诉投诉",
            complainantID: "userID",
            complainantName: "投诉人",
            pictures: ["https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=2429140882,3752935274&fm=26&gp=0.jpg",
                "https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=620114211,2321132725&fm=26&gp=0.jpg"],
            complainTime: +new Date(),
            handling: null,
            state: 0,
        };
        let res = Array(size)
            .fill(undefined)
            .map((_, index) => {
            return {
                ...vo,
                _id: Math.random(),
                complainantName: "投诉人" + keyword,
                state: index % 2,
                handling: index % 2 ? null : {
                    result: "处理结果处理结果",
                    time: +new Date()
                }
            }
        });
        res = await httpMock(res);
        return res.data;
    }

    async handle(complaintID, result) {
        return httpMock(null);
    }
}

let complaintApi: IComplaintApi;
if (USE_MOCK) {
    complaintApi = new MockComplaintApi();
}

export default complaintApi;