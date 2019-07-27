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
    return {
      code: 404,
      message: '找不到您的信息'
    }
  }

  let user = data[0]

  delete user._openid

  return user
}