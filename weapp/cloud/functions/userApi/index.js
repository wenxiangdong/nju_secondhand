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
    console.log('----------> 进入 userApi 全局中间件')
    ctx.data = {}
    ctx.data.openid = event.openid || cloud.getWXContext().OPENID
    console.log(ctx.data.openid)
    ctx.data.userCollection = db.collection('user')

    await next();
    console.log('----------> 退出 userApi 全局中间件')
  })


  // 用于在某些接口方法前检查用户是否处于正常状态（已注册，未冻结......）
  app.router([], async(ctx, next) => {
    try {
      let self = await login(ctx.data.openid);
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
    } catch (e) {
      ctx.body = e
    }
  })

  app.router('checkState', async(ctx) => {
    let result = await ctx.data.userCollection
      .where({
        _openid: ctx.data.openid
      })
      .limit(1)
      .get();


    let data = result.data;

    if (!data.length) {
      ctx.body = {
        code: HttpCode.Success,
        data: UserState.UnRegistered
      };
    } else {
      ctx.body = {
        code: HttpCode.Success,
        data: data[0].state
      };
    }
  })

  app.router('login', async(ctx) => {
    try {
      let self = await login(ctx.data.openid)
      ctx.body = {
        code: HttpCode.Success,
        data: self
      }
    } catch (e) {
      ctx.body = e
    }
  })

  app.router('getUserInfo', async(ctx) => {
    const userID = event.userID;

    try {
      let result = await ctx.data.userCollection
        .doc(userID)
        .get()

      if (!result) {
        ctx.body = {
          code: HttpCode.Not_Found,
          message: '找不到该用户信息',
        }
      } else {
        let user = result.data;

        delete user._openid;
        ctx.body = {
          code: HttpCode.Success,
          data: user
        }
      }

    } catch (e) {
      ctx.body = {
        code: HttpCode.Not_Found,
        message: '找不到该用户信息',
      }
    }
  })

  app.router('getUsersByAdmin', async(ctx) => {
    let result = await ctx.data.userCollection
      .where(command
        .or([{
          nickname: db.RegExp({
            regexp: event.keyword,
            options: 'i',
          }),
        }, {
          phone: db.RegExp({
            regexp: event.keyword,
            options: 'i',
          }),
        }, {
          email: db.RegExp({
            regexp: event.keyword,
            options: 'i',
          }),
        }]).and({
          state: event.state
        }))
      .skip(event.lastIndex)
      .limit(event.size)
      .get()

    ctx.body = {
      code: HttpCode.Success,
      data: result.data
    }
  })

  app.router("updateUserByAdmin", async(ctx) => {
    await ctx.data.userCollection
      .where({
        _id: event.userID,
      })
      .update({
        data: {
          state: event.state
        }
      })

    ctx.body = {
      code: HttpCode.Success
    }
  })

  return app.serve();
}

async function login(openid) {
  let result = await db.collection('user')
    .where({
      _openid: openid
    })
    .limit(1)
    .get();

  let data = result.data;

  if (!data.length) {
    throw {
      code: HttpCode.Not_Found,
      message: '找不到您的个人信息'
    }
  }

  let self = data[0];

  delete self._openid;

  return self;
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