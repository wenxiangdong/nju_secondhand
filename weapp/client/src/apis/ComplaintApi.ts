import {VO, httpRequest, mockHttpRequest} from "./HttpRequest";

export interface IComplaintApi {
  complain(complaint: ComplaintDTO): Promise<void>;

  getComplaints(lastIndex: number, size: number): Promise<ComplaintVO[]>;
}

const functionName = 'api'

class ComplaintApi implements IComplaintApi {
  async complain(complaint: ComplaintDTO): Promise<void> {
    return await httpRequest.callFunction<void>(functionName, { $url: "complain", complaint });
  }
  async getComplaints(lastIndex: number, size: number): Promise<ComplaintVO[]> {
    return await httpRequest.callFunction<ComplaintVO[]>(functionName, { $url: "getComplaints", lastIndex, size });
  }
}

class MockComplaintApi implements IComplaintApi {
  private readonly complaintCount = 20;
  complain(complaint: ComplaintDTO): Promise<void> {
    console.log('complain', complaint);
    return mockHttpRequest.success();
  }
  getComplaints(lastIndex: number, size: number = 10): Promise<ComplaintVO[]> {
    let complaints: ComplaintVO[] = [];
    if (lastIndex < this.complaintCount) {
      complaints = new Array(size).fill(null)
        .map(() => MockComplaintApi.createMockComplaint());
    }
    return mockHttpRequest.success(complaints);
  }

  static createMockComplaint(): ComplaintVO {
    const handled = Math.random() > 0.5;
    return {
      _id: '1',
      orderID: 'orderID',
      desc: 'descdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdescdesc',

      complainantID: 'complaintID',
      complainantName: 'complaintName',

      pictures: [
        'cloud://dev-mecmb.6465-dev-mecmb/complaint/complaint_1566567497247_0',
        'cloud://dev-mecmb.6465-dev-mecmb/complaint/complaint_1566567497247_0',
        'cloud://dev-mecmb.6465-dev-mecmb/complaint/complaint_1566567497247_0',
        'cloud://dev-mecmb.6465-dev-mecmb/complaint/complaint_1566567497247_0',
        'cloud://dev-mecmb.6465-dev-mecmb/complaint/complaint_1566567497247_0'
      ],

      complainTime: Date.now(),

      handling: handled? this.createMockHandling(): undefined,

      state: handled? ComplaintState.Handled: ComplaintState.Ongoing,
    };
  }

  static createMockHandling(): Handling {
    return {
      time: Date.now(),
      result: 'resultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresultresult'
    }
  }
}

let complainApi: IComplaintApi = new ComplaintApi();
let mockComplaintApi: IComplaintApi = new MockComplaintApi();
export { complainApi, mockComplaintApi, MockComplaintApi }


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

  handling: Handling | undefined; // 未处理的投诉不具有该属性

  state: ComplaintState;
}

export interface Handling {
  time: number,
  result: string
}

export enum ComplaintState {
  Ongoing = 0,
  Handled = 1
}
