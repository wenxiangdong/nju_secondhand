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
    console.log('----------> 进入 circleApi 全局中间件')
    ctx.data = {}
    ctx.data.openid = cloud.getWXContext().OPENID
    ctx.data.postCollection = db.collection('post')

    await next();
    console.log('----------> 退出 circleApi 全局中间件')
  })

  app.router(['publishPost', 'comment'], async(ctx, next) => {
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

  app.router('publishPost', async(ctx) => {
    let post = event.post;

    post.ownerID = ctx.data.self._id
    post.ownerName = ctx.data.self.nickname

    post.publishTime = Date.now()
    post.comments = []

    await ctx.data.postCollection
      .add({
        data: post
      })

    ctx.body = {
      code: HttpCode.Success
    }
  })

  app.router('comment', async(ctx) => {
    console.log(event.postID)

    await ctx.data.postCollection
      .doc(event.postID)
      .update({
        data: {
          comments: command.push([{
            nickname: ctx.data.self.nickname,
            content: event.content,
            commentTime: Date.now()
          }])
        }
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