import { VO } from "./HttpRequest";

export interface IComplaintApi {
    complain(complaint: ComplaintDTO): Promise<void>;

    getComplaints(lastIndex: number, size?: number): Promise<ComplaintVO[]>;
}

class ComplaintApi implements IComplaintApi {
    complain(complaint: ComplaintDTO): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getComplaints(lastIndex: number, size: number = 10): Promise<ComplaintVO[]> {
        throw new Error("Method not implemented.");
    }
}

class MockComplaintApi implements IComplaintApi {
    complain(complaint: ComplaintDTO): Promise<void> {
        throw new Error("Method not implemented.");
    }
    getComplaints(lastIndex: number, size: number = 10): Promise<ComplaintVO[]> {
        throw new Error("Method not implemented.");
    }
}

let complainApi: IComplaintApi = new ComplaintApi();
let mockComplaintApi: IComplaintApi = new MockComplaintApi();
export { complainApi, mockComplaintApi }


export interface ComplaintDTO {
    orderID: string // 订单编号
    desc: string

    pictures: Array<string>;
}

export interface ComplaintVO extends VO {
    orderID: string // 订单编号
    desc: string

    complainantID: string;
    complainantName: string;

    pictures: Array<string>;

    complainTime: number;
    handleTime: number;

    result: string;
    state: ComplaintState;
}

export enum ComplaintState {
    OnGoing,
    Handled
}