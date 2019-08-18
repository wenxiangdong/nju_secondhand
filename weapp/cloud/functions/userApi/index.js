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
    const {
      openid,
      userCollection
    } = ctx.data;
    let result = await userCollection
      .where({
        _openid: openid
      })
      .limit(1)
      .field({
        state: true
      })
      .get();


    let users = result.data;

    ctx.body = {
      code: HttpCode.Success,
      data: users.length ? users[0].state : UserState.UnRegistered
    }
  })

  app.router('login', async(ctx) => {
    const {
      openid,
      userCollection
    } = ctx.data;

    try {
      let self = await login(openid)
      ctx.body = {
        code: HttpCode.Success,
        data: self
      }
    } catch (e) {
      ctx.body = e
    }
  })

  app.router('getUserInfo', async(ctx) => {
    const {
      userID
    } = event;

    const {
      openid,
      userCollection
    } = ctx.data;

    let result = await userCollection
      .doc(userID)
      .field({
        _openid: false
      })
      .get()

    let user = result.data;

    ctx.body = {
      code: HttpCode.Success,
      data: user
    }
  })

  app.router('getUsersByAdmin', async(ctx) => {
    const {
      keyword,
      lastIndex,
      size,
      state
    } = event

    const {
      openid,
      userCollection
    } = ctx.data;

    let result = await userCollection
      .where(keyword ? command
        .or(
          [{
            nickname: db.RegExp({
              regexp: keyword,
              options: 'i',
            }),
          }, {
            phone: db.RegExp({
              regexp: keyword,
              options: 'i',
            }),
          }, {
            email: db.RegExp({
              regexp: keyword,
              options: 'i',
            }),
          }])
        .and({
          state
        }) : {
          state
        })
      .skip(lastIndex)
      .limit(size)

    ctx.body = {
      code: HttpCode.Success,
      data: result.data
    }
  })

  app.router("updateUserByAdmin", async(ctx) => {
    const {
      userID,
      state
    } = event

    const {
      openid,
      userCollection
    } = ctx.data;

    await userCollection
      .where({
        _id: userID,
      })
      .update({
        data: {
          state
        }
      })

    ctx.body = {
      code: HttpCode.Success
    }
  })

  return app.serve();
}

const login = async(openid) => {
  let result = await db.collection('user')
    .where({
      _openid: openid
    })
    .limit(1)
    .field({
      _openid: false
    })
    .get();

  let users = result.data;

  if (!users.length) {
    throw {
      code: HttpCode.Not_Found,
      message: '找不到您的个人信息'
    }
  }

  return users[0];
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