export interface CategoryVO extends VO {
    name: string;
    icon: string;
}

export interface GoodsVO extends VO {
    sellerID: string;
    sellerName: string;

    name: string;
    desc: string;
    price: string;
    pictures: Array<string>;
    category: CategoryVO;
    num: number;

    publishTime: number;

    state: GoodsState;
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