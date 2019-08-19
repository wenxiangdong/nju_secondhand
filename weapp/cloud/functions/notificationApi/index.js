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

  app.router('getNotifications', async(ctx) => {
    let result = await ctx.data.notificationCollection
      .where({
        userID: ctx.data.self._id,
      })
      .skip(event.lastIndex)
      .limit(event.size)
      .get()

    ctx.body = {
      data: result.data,
      code: HttpCode.Success
    }
  })

  app.router('sendNotification', async(ctx) => {
    let notification = event.notification
    notification.time = Date.now()

    await ctx.data.notificationCollection
      .add({
        data: notification
      })
      
    ctx.body = {
      code: HttpCode.Success
    }
  })

  return app.serve();
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