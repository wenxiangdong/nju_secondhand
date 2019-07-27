// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const user = await cloud.callFunction("isNormal");

  let goodsList = [];
  let data = [];
  let skip = 0;
  const limit = 20;
  while (data = (await db.collection('goods')
    .where({
      ownerID: user._id,
      state: GoodsState.InSale
    })
    .skip(skip)
    .limit(limit)
    .get())
    .data) {

    goodsList = goodsList.concat(data)

    if (data.length < limit) {
      break;
    }

    skip += limit;
  }
  return goodsList;
}

const GoodsState = {
  InSale: 0,
  Deleted: 1
}