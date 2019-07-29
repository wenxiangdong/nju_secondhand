// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRounter = require('tcb-router')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  const app = new TcbRounter({
    event
  })

  app.use(async(ctx, next) => {
    console.log('----------> 进入 notificationApi 全局中间件')
    ctx.data = {}
    ctx.data.openid = cloud.getWXContext().OPENID
    ctx.data.notificationCollection = db.collection('notification')

    await next();
    console.log('----------> 退出 notificationtApi 全局中间件')
  })

  app.router(['getNotifications'], async(ctx, next) => {
    let self = await cloud.callFunction('userApi', {
      $url: 'getNormalSelf',
      opneid: ctx.data.openid
    }).result;
    ctx.data.self = self;

    await next();
  })

  app.router('getNotifications', async(ctx) => {
    let result = await ctx.data.notificationCollection
      .where({
        userID: ctx.data.self._id,
      })
      .skip(event.lastIndex)
      .limit(event.size)
      .get()

    ctx.body = result.data
  })

  app.router('sendNotification', async(ctx) => {
    let notification = event.notification
    notification.time = Date.now()

    await ctx.data.notificationCollection
      .add({
        data: notification
      })
  })

  return app.serve();
}