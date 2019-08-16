// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRounter = require('tcb-router')

cloud.init()

const db = cloud.database()

const command = db.command

// 云函数入口函数
exports.main = async(event, context) => {
  const app = new TcbRounter({
    event
  })

  app.use(async(ctx, next) => {
    console.log('----------> 进入 goodsApi 全局中间件')
    ctx.data = {}
    ctx.data.openid = cloud.getWXContext().OPENID
    ctx.data.categoryCollection = db.collection('category')
    ctx.data.goodsCollection = db.collection('goods')
    // 增加订单的集合，因为购买时要创建订单 by eric
    ctx.data.orderCollection = db.collection("order");

    await next();
    console.log('----------> 退出 goodsApi 全局中间件')
  })

  app.router(['publishGoods', 'getOngoingGoods', 'deleteGoods',
    'purchase'
  ], async(ctx, next) => {
    let loginResult = (await cloud.callFunction({
      name: 'userApi',
      data: {
        $url: 'login',
        openid: ctx.data.openid
      }
    })).result;

    if (loginResult.code === HttpCode.Not_Found) {
      ctx = {
        code: HttpCode.Not_Found,
        message: '找不到您的个人消息'
      }
    } else {
      self = loginResult.data
      switch (self.state) {
        case UserState.Frozen:
          ctx.body = {
            code: HttpCode.Forbidden,
            message: '您的帐户被冻结'
          }
          break
        default:
          ctx.data.self = self;
          await next();
      }
    }
  })

  app.router('getCategories', async(ctx) => {
    let categories = [];
    let skip = 0;
    const limit = 20;

    let data;
    while (data = (await ctx.data.categoryCollection
        .skip(skip)
        .limit(limit)
        .get())
      .data) {

      categories = categories.concat(data);

      if (data.length < limit) {
        break;
      }

      skip += limit;
    }

    ctx.body = {
      code: HttpCode.Success,
      data: categories
    };
  })

  app.router('searchGoodsByKeyword', async(ctx) => {
    let goodsList = await searchGoodsByKeyword(event.keyword, event.lastIndex, event.size)
    ctx.body = {
      code: HttpCode.Success,
      data: goodsList
    }
  })

  app.router('searchGoodsByCategory', async(ctx) => {
    let goodsList = await searchGoodsByCategory(event.categoryID, event.lastIndex, event.size)
    ctx.body = {
      code: HttpCode.Success,
      data: goodsList
    }
  })

  app.router('searchGoodsWithSellerByKeyword', async(ctx) => {
    let goodsList = await searchGoodsByKeyword(event.keyword, event.lastIndex, event.size)

    let goodsWithSellers = []
    for (let goods of goodsList) {
      goodsWithSellers.push({
        goods,
        seller: await getSeller(goods.sellerID)
      })
    }
    ctx.body = {
      code: HttpCode.Success,
      data: goodsWithSellers
    }
  })

  app.router('searchGoodsWithSellerByCategory', async(ctx) => {
    let goodsList = await searchGoodsByCategory(event.categoryID, event.lastIndex, event.size)

    let goodsWithSellers = []
    for (let goods of goodsList) {
      goodsWithSellers.push({
        goods,
        seller: await getSeller(goods.sellerID)
      })
    }
    ctx.body = {
      code: HttpCode.Success,
      data: goodsWithSellers
    }
  })

  app.router('getGoodsWithSeller', async(ctx) => {
    try {
      let goods = await getGoods(event.goodsID)

      let seller = await getSeller(goods.sellerID)

      ctx.body = {
        code: HttpCode.Success,
        data: {
          seller,
          goods
        }
      }
    } catch (e) {
      ctx.body = e
    }
  })

  app.router('getGoods', async(ctx) => {
    try {
      let goods = await getGoods(event.goodsID)

      ctx.body = {
        code: HttpCode.Success,
        data: goods
      }
    } catch (e) {
      ctx.body = e
    }
  })

  app.router('publishGoods', async(ctx) => {
    let goods = event.goods;

    goods.sellerID = ctx.data.self._id;
    goods.sellerName = ctx.data.self.nickname;

    try {
      let categoryResult = await ctx.data.categoryCollection
        .doc(goods.categoryID)
        .get();

      let data = categoryResult.data;

      if (!data) {
        ctx.body = {
          code: HttpCode.Not_Found,
          message: '找不到商品分类信息'
        }
      } else {
        let category = data

        goods.category = category;
        delete goods.categoryID;

        goods.publishTime = Date.now()

        goods.state = GoodsState.InSale

        await ctx.data.goodsCollection
          .add({
            data: goods
          })


        ctx.body = {
          code: HttpCode.Success
        }
      }
    } catch (e) {
      ctx.body = {
        code: HttpCode.Not_Found,
        message: '发布失败，请检查商品分类消息等是否正确'
      }
    }
  })

  app.router('getOngoingGoods', async(ctx) => {
    let goodsList = [];
    let data = [];
    let skip = 0;
    const limit = 20;

    do {
      let result = await ctx.data.goodsCollection
        .where({
          sellerID: ctx.data.self._id,
          state: GoodsState.InSale
        })
        .skip(skip)
        .limit(limit)
        .get();

      let data = result.data;

      goodsList = goodsList.concat(data);
    } while (data.length >= limit);

    ctx.body = {
      code: HttpCode.Success,
      data: goodsList
    }
  })

  app.router('deleteGoods', async(ctx) => {
    await ctx.data.goodsCollection
      .where({
        _id: event.goodsID,
        sellerID: ctx.data.self._id,
      })
      .update({
        data: {
          state: GoodsState.Deleted
        }
      })
    ctx.body = {
      code: HttpCode.Success,
    }
  })

  app.router('deleteGoodsByAdmin', async(ctx) => {
    await ctx.data.goodsCollection
      .where({
        _id: event.goodsID,
      })
      .update({
        data: {
          state: GoodsState.Deleted
        }
      })

    return {
      code: HttpCode.Success
    }
  })

  /**
   * 步骤：
   * 1. 查询商品，下架
   * 2. 新建订单
   * 3. 调用 预支付并返回数据包
   * goodsID: string
   */
  app.router('purchase', async (ctx) => {
    const {goodsID = -1} = event;
    const {goodsCollection, orderCollection, self} = ctx.data;
    // 查询是否有这个商品
    const goodsList = await goodsCollection
      .where({
        _id: goodsID
      })
      .get();
      if (!goodsList || !goodsList.length) {
        throw {
          code: HttpCode.Not_Found,
          message: '找不到该商品'
        }
      }
      // 对商品下单，创建订单和让商品下架
      await goodsCollection.doc(goodsID).update({
        data: {
          state: GoodsState.Deleted
        }
      });
      // 下个单
      const goods = goodsList[0]; // 取goods
      const order = {
        // buyer就是当前用户
          buyerID: self._id,
          buyerName: self.nickName,
        // seller的信息其实都在 goods中
          sellerID: goods.sellerID,
          sellerName: goods.sellerName,
        
          goodsID: goods._id,
          goodsName: goods.name,
          goodsPrice: goods.price,
        
          address: self.address,
        
          orderTime: +new Date(),
          deliveryTime: -1, // -1 表示还未送达
        
          state: OrderState.Paying
      };
      // 这里插失败都要回滚，将商品的信息改回来 
      try {
        const {_id} = await orderCollection.add({
          data: order
        });
        order._id = _id;
        console.log("插入的order", order);
      } catch (error) {
        // 放着异步做了，无力的保证
        goodsCollection.doc(goodsID).update({
          data: {
            state: GoodsState.InSale
          }
        });
        console.error(error);
        throw {
          code: HttpCode.Fail,
          message: "下单失败，请重试"
        };
      }
      // 调用支付
      return (
        await cloud.callFunction("accountApi", {
          /**
           * 参数
           * payTitle 支付的标题，例“商品xxx”
           * payAmount 支付的金额
           * orderID 要保证唯一性，此笔交易的id
           */
          payTitle: goods.name,
          payAmount: order.price,
          orderID: order._id,
          $url: "pay",
        })
      ).result;
  })

  return app.serve();
}

async function getGoods(goodsID) {
  try {
    let goodsCollection = db.collection('goods')

    let result = await goodsCollection
      .doc(goodsID)
      .get()

    return result.data
  } catch (e) {
    throw {
      code: HttpCode.Not_Found,
      message: '找不到商品消息'
    }
  }
}

async function getSeller(sellerID) {
  try {
    let result = await cloud.callFunction({
      name: 'userApi',
      data: {
        $url: 'getUserInfo',
        userID: sellerID
      }
    })

    let seller = result.result

    return seller
  } catch (e) {
    throw {
      code: HttpCode.Not_Found,
      message: '找不到卖家消息'
    }
  }
}

async function searchGoodsByKeyword(keyword, lastIndex, size) {
  let result = await db.collection('goods')
    .where(
      keyword ?
      command
      .or([{
          name: db.RegExp({
            regexp: keyword,
            options: 'i',
          })
        },
        {
          category: {
            name: db.RegExp({
              regexp: keyword,
              options: 'i'
            })
          }
        }
      ])
      .and({
        state: GoodsState.InSale
      }) : {
        state: GoodsState.InSale
      }
    )
    .skip(lastIndex)
    .limit(size)
    .get()

  return result.data
}

async function searchGoodsByCategory(categoryID, lastIndex, size) {
  let result = await db.collection('goods')
    .where({
      category: {
        _id: categoryID
      },
      state: GoodsState.InSale
    })
    .skip(lastIndex)
    .limit(size)
    .get()

  return result.data
}

const GoodsState = {
  InSale: 0,
  Deleted: 1
}

const UserState = {
  UnRegistered: 0, // 未注册
  Normal: 1,
  Frozen: 2, // 被管理员冻结
}

const HttpCode = {
  Success: 200,
  Forbidden: 403, // 403
  Not_Found: 404, // 404
  Conflict: 409, // 409 冲突
  Fail: 500 // 500
}

const OrderState = {
  Ongoing: 0,
  Finished: 1,
  Paying: -1  // 正在支付中
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

// interface UserVO extends VO {
//   // _openid: string;  为安全性考虑，不将该属性返回

//   phone: string;
//   avatar: string;
//   nickname: string;
//   address: Location;
//   email: string;

//   account: AccountVO;

//   signUpTime: number;
//   state: UserState;
// }