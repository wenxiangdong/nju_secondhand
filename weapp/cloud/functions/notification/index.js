// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

const userCollection = cloud.database().collection("user");
const notiCollection = cloud.database().collection("notification");


// 云函数入口函数
/**
 * 轮询拿 新的 系统消息
 * @param event
 * @param context
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const openID = wxContext.OPENID;

  const user = (await userCollection.where({
    _openid: openID
  })
      .limit(1)
      .get()
  ).data[0];

  if (!user) {
    return {
      code: 404,
      message: "用户不存在"
    }
  }

  const notifications = (await notiCollection.where({
    userID: user._id,
    read: ''
  }).get()).data;

  console.log(notifications);

  // 异步更新 notifications
  notiCollection.where({
    userID: user._id,
    read: undefined
  }).update({
    data: {
      read: true
    }
  });

  return {
    code: 200,
    data: notifications
  }
};