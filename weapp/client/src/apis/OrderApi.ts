import { VO, httpRequest } from "./HttpRequest";

export interface IOrderApi {
  getBuyerOngoingOrders(lastIndex: number, size?: number): Promise<OrderVO[]>;

  accept(orderID: string): Promise<void>;

  getBuyerHistoryOrders(lastIndex: number, size?: number): Promise<OrderVO[]>;

  getSellerOngoingOrders(lastIndex: number, size?: number): Promise<OrderVO[]>;

  getSellerHistoryOrders(lastIndex: number, size?: number): Promise<OrderVO[]>;
}

const functionName = 'orderApi'

class OrderApi implements IOrderApi {
  async getBuyerOngoingOrders(lastIndex: number, size: number = 10): Promise<OrderVO[]> {
    return await httpRequest.callFunction<OrderVO[]>(functionName, { $url: "getBuyerOrders", lastIndex, size, state: OrderState.Ongoing });
  }
  async accept(orderID: string): Promise<void> {
    return await httpRequest.callFunction<void>(functionName, { $url: "accept", orderID });
  }
  async getBuyerHistoryOrders(lastIndex: number, size: number = 10): Promise<OrderVO[]> {
    return await httpRequest.callFunction<OrderVO[]>(functionName, { $url: "getBuyerOrders", lastIndex, size, state: OrderState.Finished });
  }
  async getSellerOngoingOrders(lastIndex: number, size: number = 10): Promise<OrderVO[]> {
    return await httpRequest.callFunction<OrderVO[]>(functionName, { $url: "getSellerOrders", lastIndex, size, state: OrderState.Ongoing });
  }
  async getSellerHistoryOrders(lastIndex: number, size: number = 10): Promise<OrderVO[]> {
    return await httpRequest.callFunction<OrderVO[]>(functionName, { $url: "getSellerOrders", lastIndex, size, state: OrderState.Finished });
  }
}

class MockOrderApi implements IOrderApi {
  getBuyerOngoingOrders(lastIndex: number, size: number = 10): Promise<OrderVO[]> {
    throw new Error("Method not implemented.");
  }
  accept(orderID: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getBuyerHistoryOrders(lastIndex: number, size: number = 10): Promise<OrderVO[]> {
    throw new Error("Method not implemented.");
  }
  getSellerOngoingOrders(lastIndex: number, size: number = 10): Promise<OrderVO[]> {
    throw new Error("Method not implemented.");
  }
  getSellerHistoryOrders(lastIndex: number, size: number = 10): Promise<OrderVO[]> {
    throw new Error("Method not implemented.");
  }
}

let orderApi: IOrderApi = new OrderApi();
let mockOrderApi: IOrderApi = new MockOrderApi();
export { orderApi, mockOrderApi }


export interface OrderDTO {
  buyerID: string;

  goodID: string;
}


export interface OrderVO extends VO {
  buyerID: string;
  buyerName: string;

  sellerID: string;
  sellerName: string;

  goodsID: string;
  goodsName: string;
  goodsPrice: string;

  address: Location;

  orderTime: number;
  deliveryTime: number; // -1 表示还未送达

  state: OrderState;
}

export enum OrderState {
  Ongoing,
  Finished,
}
