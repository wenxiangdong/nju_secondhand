// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRounter = require('tcb-router')

cloud.init()

const db = cloud.database()
const command = db.command()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRounter({
    event
  })

  app.use(async (ctx, next) => {
    console.log('----------> 进入 circleApi 全局中间件')
    ctx.data = {}
    ctx.data.openid = cloud.getWXContext().OPENID
    ctx.data.postCollection = db.collection('post')

    await next();
    console.log('----------> 退出 circleApi 全局中间件')
  })

  app.router(['publishPost', 'comment'], async (ctx, next) => {
    let self = await cloud.callFunction('userApi', {
      $url: 'getNormalSelf',
      openid: ctx.data.openid
    }).result;
    ctx.data.self = JSON.parse(self);

    await next();
  })

  app.router('publish', async (ctx) => {
    let post = event.post;

    post.ownerID = user._id
    post.ownerName = user.nickname

    post.publishTime = Date.now()
    post.comments = []

    await ctx.data.postCollection
      .add({
        data: post
      })
  })

  app.router('comment', async (ctx) => {
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
  })

  return app.serve();
}