// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();


// 云函数入口函数

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();
  const userCollection = cloud.database().collection("user");
  const notiCollection = cloud.database().collection("notification");
  const openID = wxContext.OPENID;
  if (!openID) {
    return {
      code: 500,
      message: "open id不存在"
    }
  }

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

  console.log(user);

  const notifications = (await notiCollection.where({
    userID: user._id,
    read: false
  }).get()).data;

  console.log(notifications);

  // 异步更新 notifications
  notiCollection.where({
    userID: user._id,
    read: false
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