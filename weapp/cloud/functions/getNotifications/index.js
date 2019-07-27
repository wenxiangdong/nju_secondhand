// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const user = cloud.callFunction('isNormal')

  return (await db.collection('notification')
    .where({
      userID: user._id,
    })
    .orderBy('time', 'desc')
    .skip(event.lastIndex)
    .limit(event.size)
    .get())
    .data
}