// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const userID = event.userID;

  let user = (await db.collection('user')
    .doc(userID)
    .get())
    .data

  if (!user) {
    return {
      code: 404,
      message: '找不到该用户'
    }
  }

  delete user._openid

  return user;
}