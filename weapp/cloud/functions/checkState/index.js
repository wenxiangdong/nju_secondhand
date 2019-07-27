// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  const openid = cloud.getWXContext().OPENID;

  let data =
    (await db.collection('user')
      .where({
        _openid: openid
      })
      .limit(1)
      .get())
      .data;

  if (!data.length) {
    return UserState.UnRegistered;
  }

  let user = data[0];
  return user.state;
}

const UserState = {
  UnRegistered, // 未注册
  Normal,
  Forzen, // 被管理员冻结
}