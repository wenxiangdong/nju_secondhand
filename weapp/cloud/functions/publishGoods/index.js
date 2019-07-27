// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const user = await cloud.callFunction("isNormal");
  let goods = event.goods;
  // 所有者ID
  goods.sellerID = user._id;

  // 商品分类
  goods.category = (await db.collection("category")
    .doc(goods.categoryID)
    .get()).data

  delete goods.categoryID

  // 发布时间
  goods.publishTime = Date.now()

  // 初始状态
  goods.state = GoodsState.InSale

  // 加入数据库
  await db.collection("goods")
    .add({
      data: goods
    })
}

const GoodsState = {
  InSale: 0,
  Deleted: 1
}