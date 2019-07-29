// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const user = await cloud.callFunction('isNormal');

  let order = {}

  order.buyerID = user._id;
  order.buyerName = user.nickname;
  order.address = user.location;

  let goods = (await db.collection('goods')
    .doc(event.goodsID)
    .get())
    .data
  let seller = (await cloud.callFunction('getUserInfo', {
    userID: goods.sellerID
  }))

  order.sellerID = seller._id;
  order.sellerName = seller.nickname;

  order.goodsID = goods._id;
  order.goodsName = goods.name;
  order.goodsPrice = goods.price;

  order.orderTime = Date.now();
  order.deliveryTime = -1;

  order.state = OrderState.Ongoing;

  await db.collection('order')
    .add({
      data: order
    })
}

const OrderState = {
  Ongoing: 0,
  Finished: 1,
}