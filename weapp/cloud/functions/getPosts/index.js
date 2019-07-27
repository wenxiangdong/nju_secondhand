// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const user = await cloud.callFunction('isNormal');
  return (await db.collection('post')
    .where({
      ownerID: user._id,
    })
    .skip(event.lastIndex)
    .limit(event.size)
    .get())
    .data
}