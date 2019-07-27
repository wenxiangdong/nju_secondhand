// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  let notification = event.notification
  notification.time = Date.now()
  
  await db.collection('notification')
    .add({
      data: notification
    })
}