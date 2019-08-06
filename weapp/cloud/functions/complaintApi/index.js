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
    console.log('----------> 进入 complaintApi 全局中间件')
    ctx.data = {}
    ctx.data.openid = cloud.getWXContext().OPENID
    ctx.data.complaintCollection = db.collection('complaint')

    await next();
    console.log('----------> 退出 complaintApi 全局中间件')
  })

  app.router(['complain', 'getComplaints'], async(ctx, next) => {
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

    ctx.body = {
      code: HttpCode.Success
    }
  })

  app.router('getComplaints', async(ctx) => {
    let result = await ctx.data.complaintCollection
      .where({
        complaintID: ctx.data.self._id
      })
      .skip(event.lastIndex)
      .limit(event.size)
      .get()

    ctx.body = {
      data: result.data,
      code: HttpCode.Success
    }
  })

  app.router('getComplaintsByAdmin', async(ctx) => {
    let result = await ctx.data.complaintCollection
      .where({
        desc: db.RegExp({
          regexp: event.keyword,
          options: 'i'
        })
      })
      .skip(event.lastIndex)
      .limit(event.size)
      .get()

    ctx.body = result.data
  })

  app.router('handle', async(ctx) => {
    await ctx.data.complaintCollection
      .where({
        _id: event.complaintID,
        state: ComplaintState.Ongoing
      }).update({
        data: {
          handling: {
            time: Date.now(),
            result: event.result
          },
          state: ComplaintState.Handled
        }
      })
  })

  return app.serve();
}

const ComplaintState = {
  Ongoing: 0,
  Handled: 1
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