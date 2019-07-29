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
    console.log('----------> 进入 complaintApi 全局中间件')
    ctx.data = {}
    ctx.data.openid = cloud.getWXContext().OPENID
    ctx.data.complaintCollection = db.collection('complaint')

    await next();
    console.log('----------> 退出 complaintApi 全局中间件')
  })

  app.router(['complain', 'getComplaints'], async(ctx, next) => {
    let self = await cloud.callFunction('userApi', {
      $url: 'getNormalSelf',
      opneid: ctx.data.openid
    }).result;
    ctx.data.self = self;

    await next();
  })

  app.router('complain', async(ctx) => {
    let complaint = event.complaint

    complaint.complaintID = ctx.data.self._id
    complaint.complaintName = ctx.data.self.nickName

    complaint.complainTime = Date.now()

    complaint.handling = null

    complaint.state = ComplaintState.Ongoing

    await ctx.data.complaintCollection
      .add({
        data: complaint
      })
  })

  app.router('getComplaints', async(ctx) => {
    let result = await ctx.data.complaintCollection
      .where({
        complaintID: ctx.data.self._id
      })
      .skip(event.lastIndex)
      .limit(event.size)
      .get()

    ctx.body = result.data
  })

  return app.serve();
}

const ComplaintState = {
  Ongoing: 0,
  Handled: 1
}