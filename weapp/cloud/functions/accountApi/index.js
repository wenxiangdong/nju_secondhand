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
    console.log('----------> 进入 accountApi 全局中间件')
    ctx.data = {}
    ctx.data.openid = cloud.getWXContext().OPENID
    ctx.data.userCollection = db.collection('user')

    await next();
    console.log('----------> 退出 accountApi 全局中间件')
  })

  app.router(['withdraw'], async(ctx, next) => {
    let self = await cloud.callFunction('userApi', {
      $url: 'getNormalSelf',
      opneid: ctx.data.openid
    }).result;
    ctx.data.self = self;

    await next();
  })

  app.router('withdraw', async(ctx) => {

  })

  return app.serve();
}