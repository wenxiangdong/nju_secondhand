// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const command = db.command()

// 云函数入口函数
exports.main = async (event, context) => {
  const user = await cloud.callFunction('isNormal');

  return await db.collection('post')
    .doc(event.postID)
    .update({
      data: {
        comments: command.push([
          {
            nickname: user.nickname,
            content: event.content,
            commentTime: Date.now()
          }
        ])
      }
    })
}