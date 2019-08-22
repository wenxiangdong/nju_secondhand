// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const command = db.command
const tenMinutesAgo = -10 * 60 * 1000

// 云函数入口函数
exports.main = async (event, context) => {
  const condition = {
    state: OrderState.Paying,
    orderTime: command.lte(Date.now() + tenMinutesAgo)
  }
  const expiredOrders = db.collection('order').where(condition)

  const MAX_LIMIT = 100
  const countResult = await expiredOrders.count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = expiredOrders.skip(i * MAX_LIMIT).limit(MAX_LIMIT).field({
      goodsID: true
    }).get()
    tasks.push(promise)
  }

  const goodsIDs =
    (await Promise.all(tasks))
      .reduce((acc, cur) => {
        return {
          data: acc.data.concat(cur.data)
        }
      }, { data: [] }).data
      .map(order => order.goodsID);

  await Promise.all(
    [
      expiredOrders.remove(),
      db.collection('goods')
        .where({_id: command.in(goodsIDs)})
        .update({
          data: {state: GoodsState.InSale}
        })
    ]
  )
}

const OrderState = {
  Ongoing: 0,
  Finished: 1,
  Paying: -1 // 正在支付中 by eric
}

const GoodsState = {
  InSale: 0,
  Deleted: 1
}

const HttpCode = {
  Success: 200,
  Forbidden: 403, // 403
  Not_Found: 404, // 404
  Conflict: 409, // 409 冲突
  Fail: 500 // 500
}