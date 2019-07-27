// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async(event, context) => {
  const user = await cloud.callFunction('isNormal');
  let post = event.post;

  post.ownerID = user._id
  post.ownerName = user.nickname

  post.publishTime = Date.now()
  post.comments = []

  await db.collection('post')
    .add({
      data: post
    })
}