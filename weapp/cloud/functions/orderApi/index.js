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

  return app.serve();
}

const OrderState = {
  Ongoing: 0,
  Finished: 1,
  Paying: -1  // 正在支付中 by eric
}
