// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const user = await cloud.callFunction("isNormal");

  await db.collection("goods")
    .where({
      _id: event.goodsID,
      ownerID: user._id,
    })
    .update({
      data: {
        state: GoodsState.Deleted
      }
    })
}

const GoodsState = {
  InSale: 0,
  Deleted: 1
}