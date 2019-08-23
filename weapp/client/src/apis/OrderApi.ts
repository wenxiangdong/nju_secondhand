import {VO, httpRequest, mockHttpRequest} from "./HttpRequest";
import {Location, MockUserApi} from "./UserApi";
import {createRandomNumberStr} from "./Util";

export interface IOrderApi {
  getBuyerOngoingOrders(lastIndex: number, size: number): Promise<OrderVO[]>;

  accept(orderID: string): Promise<void>;

  getOrderById(orderId: string): Promise<OrderVO>;

  getBuyerHistoryOrders(lastIndex: number, size: number): Promise<OrderVO[]>;

  getSellerOngoingOrders(lastIndex: number, size: number): Promise<OrderVO[]>;

  getSellerHistoryOrders(lastIndex: number, size: number): Promise<OrderVO[]>;

  orderCallback(orderID: string, result: 0 | -1): Promise<void>;
}

const functionName = 'api'

class OrderApi implements IOrderApi {
  async orderCallback(orderID: string, result: 0 | -1): Promise<void> {
    return await httpRequest.callFunction<void>(functionName, {
      $url: "orderCallback",
      orderID,
      result
    });
  }
  async getBuyerOngoingOrders(lastIndex: number, size: number): Promise<OrderVO[]> {
    return await httpRequest.callFunction<OrderVO[]>(functionName, { $url: "getBuyerOrders", lastIndex, size, state: OrderState.Ongoing });
  }
  async accept(orderID: string): Promise<void> {
    return await httpRequest.callFunction<void>(functionName, { $url: "accept", orderID });
  }
  async getBuyerHistoryOrders(lastIndex: number, size: number): Promise<OrderVO[]> {
    return await httpRequest.callFunction<OrderVO[]>(functionName, { $url: "getBuyerOrders", lastIndex, size, state: OrderState.Finished });
  }
  async getSellerOngoingOrders(lastIndex: number, size: number): Promise<OrderVO[]> {
    return await httpRequest.callFunction<OrderVO[]>(functionName, { $url: "getSellerOrders", lastIndex, size, state: OrderState.Ongoing });
  }
  async getSellerHistoryOrders(lastIndex: number, size: number): Promise<OrderVO[]> {
    return await httpRequest.callFunction<OrderVO[]>(functionName, { $url: "getSellerOrders", lastIndex, size, state: OrderState.Finished });
  }

  async getOrderById(orderId: string): Promise<OrderVO> {
    return await httpRequest.callFunction<OrderVO>(functionName, { $url: "getOrderById", orderId });
  }
}

class MockOrderApi implements IOrderApi {
  orderCallback(orderID: string, result: 0 | -1): Promise<void> {
    return mockHttpRequest.success();
  }
  private ordersCount = 20;

  getBuyerOngoingOrders(lastIndex: number, size: number = 10): Promise<OrderVO[]> {
    let orders: OrderVO[] = this.createMockOrders(lastIndex, size);
    return mockHttpRequest.success(orders);
  }
  accept(orderID: string): Promise<void> {
    console.log('accept', orderID);
    return mockHttpRequest.success();
  }
  getBuyerHistoryOrders(lastIndex: number, size: number = 10): Promise<OrderVO[]> {
    let orders: OrderVO[] = this.createMockOrders(lastIndex, size);
    orders.forEach((o) => o.state = OrderState.Finished);
    return mockHttpRequest.success(orders);
  }
  getSellerOngoingOrders(lastIndex: number, size: number = 10): Promise<OrderVO[]> {
    let orders: OrderVO[] = this.createMockOrders(lastIndex, size);
    return mockHttpRequest.success(orders);
  }
  getSellerHistoryOrders(lastIndex: number, size: number = 10): Promise<OrderVO[]> {
    let orders: OrderVO[] = this.createMockOrders(lastIndex, size);
    orders.forEach((o) => o.state = OrderState.Finished);
    return mockHttpRequest.success(orders);
  }

  getOrderById(orderId: string): Promise<OrderVO> {
    let order = MockOrderApi.createMockOrder();
    order._id = orderId;
    return mockHttpRequest.success(order);
  }

  private createMockOrders(lastIndex: number, size: number = 10): OrderVO[] {
    let orders: OrderVO[] = [];
    if (lastIndex < this.ordersCount) {
      orders = new Array(size).fill(null)
        .map(() => MockOrderApi.createMockOrder());
    }
    return orders;
  }

  static createMockOrder(): OrderVO {
    return {
      _id: '1',
      buyerID: 'buyerID',
      buyerName: 'buyerName',

      sellerID: 'sellerID',
      sellerName: 'sellerName',

      goodsID: 'goodsID',
      goodsName: 'goodsName',
      goodsPrice: createRandomNumberStr(),

      address: MockUserApi.createMockLocation(),

      orderTime: Date.now(),
      deliveryTime: Date.now(),

      state: OrderState.Ongoing,
    }
  }
}

let orderApi: IOrderApi = new OrderApi();
let mockOrderApi: IOrderApi = new MockOrderApi();
export { orderApi, mockOrderApi, MockOrderApi }


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
  Ongoing = 0,
  Finished = 1,
  Paying = -1
}
