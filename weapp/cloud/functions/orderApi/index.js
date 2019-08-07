// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRounter = require('tcb-router')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRounter({
    event
  })

  app.use(async (ctx, next) => {
    console.log('----------> 进入 orderApi 全局中间件')
    ctx.data = {}
    ctx.data.openid = cloud.getWXContext().OPENID
    ctx.data.orderCollection = db.collection('order')

    await next();
    console.log('----------> 退出 orderApi 全局中间件')
  })

  app.router(['accept', 'getBuyerOrders', 'getSellerOrders'], async (ctx, next) => {
    let self = await cloud.callFunction('userApi', {
      $url: 'getNormalSelf',
      openid: ctx.data.openid
    }).result;
    ctx.data.self = self;

    await next();
  })

  app.router('accept', async (ctx) => {

  })

  app.router('getBuyerOrders', async (ctx) => {
    let result = await ctx.data.orderCollection
      .where({
        buyerID: ctx.data.self._id,
        state: event.state
      })
      .skip(event.lastIndex)
      .limit(event.size)
      .get()

    ctx.body = result.data
  })


  app.router('getSellerOrders', async (ctx) => {
    let result = await ctx.data.orderCollection
      .where({
        sellerID: ctx.data.self._id,
        state: event.state
      })
      .skip(event.lastIndex)
      .limit(event.size)
      .get()

    ctx.body = result.data
  })

  // 小程序的付款后回调
  // orderCallback(orderID: string, result: {0 /* 成功 */, -1 /* 失败 */})
  app.router('orderCallback', async (ctx) => {
    const {orderID = undefined, result = undefined} = event;
    const {orderCollection} = ctx.data;
    // 处理函数
    const handlers = {
      '0': async (order) => {
        await orderCollection.doc(order._id).update({
          data: {
            state: OrderState.Ongoing
          }
        });
      },
      '-1': aysnc (order) => {
        // 删除订单
        // 就算出错了也没有太多关系，放着异步
        orderCollection.doc(order._id).remove();
        // 上架商品
        // 一定要重新上架成功，否则得报错
        const goodsCollection = db.collection("goods");
        await goodsCollection.doc(order.goodsID).update({
          data: {
            state: GoodsState.InSale
          }
        });
      }
    };

    const NOT_FOUND = {
      code: HttpCode.Not_Found,
      message: "未找到订单"
    };

    // 检查参数
    if (orderID === undefined || result === undefined) {
      throw NOT_FOUND;
    }

    // 查询订单
    const order = await orderCollection.doc(orderID).get();
    if (!order) {
      throw NOT_FOUND;
    }

    // 检查订单状态，这里只处理支付中的订单
    if (order.state !== OrderState.Paying) {
      throw {
        code: HttpCode.Conflict,
        message: "该订单已经不处于支付中状态"
      };
    }

    // 处理
    const handler = handlers[result];
    try {
      await handler(order);
    } catch (error) {
      console.error(error);
      throw {
        code: HttpCode.Fail,
        message: `订单[${order._id}]处理失败，请重试，或者联系客服`;
      }
    }
  });

  return app.serve();
}

const OrderState = {
  Ongoing: 0,
  Finished: 1,
  Paying: -1  // 正在支付中 by eric
}

const GoodsState = {
  InSale: 0,
  Deleted: 1
}

const HttpCode = {
  Forbidden: 403, // 403
  Not_Found: 404, // 404
  Conflict: 409, // 409 冲突
  Fail: 500 // 500
}

// interface GoodsVO extends VO {
//   sellerID: string;
//   sellerName: string; // 给goods加一个卖家名字 by eric

//   name: string;
//   desc: string;
//   price: string;
//   pictures: Array<string>;
//   category: CategoryVO;

//   publishTime: number;

//   state: GoodsState;
// }

// export interface GoodsWithSellerVO {
// seller: UserVO;
// goods: GoodsVO
// }

// enum GoodsState {
//   InSale,
//   Deleted
// }

// export interface OrderVO extends VO {
//   buyerID: string;
//   buyerName: string;

//   sellerID: string;
//   sellerName: string;

//   goodsID: string;
//   goodsName: string;
//   goodsPrice: string;

//   address: Location;

//   orderTime: number;
//   deliveryTime: number; // -1 表示还未送达

//   state: OrderState;
// }