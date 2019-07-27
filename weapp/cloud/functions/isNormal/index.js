// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID

  let data = (await db.collection('user')
    .where({
      _openid: openid
    })
    .limit(1)
    .get())
    .data

  if (!data.length) {
    throw {
      code: 404,
      message: '找不到您的信息'
    }
  }


  let user = data[0]

  if (user.state = UserState.Forzen) {
    throw {
      code: 403,
      message: '您的帐号已被冻结，请联系管理员解冻'
    }
  }

  delete user._openid

  return user
}

const UserState = {
  UnRegistered: 0, // 未注册
  Normal: 1,
  Forzen: 2, // 被管理员冻结
}