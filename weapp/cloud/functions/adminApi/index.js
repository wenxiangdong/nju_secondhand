// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init()

const db = cloud.database()
const command = db.command

const adminName = 'admin'
const userName = 'user'
const goodsName = 'goods'
const orderName = 'order'
const complaintName = 'complaint'
const userApi = 'api'

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.router('checkAdmin', async (ctx) => {
    const { username, password } = event
    ctx.body = exists({ name: adminName, condition: { username, password } })
  })

  app.router('getComplaints', async (ctx) => {
    const { keyword, lastIndex, size } = event
    ctx.body = await getPage({
      name: complaintName,
      condition:
        command.and(
          keyword ? command.or(
            // 匹配描述
            {
              desc: db.RegExp({
                regexp: keyword,
                options: 'i'
              })
            },
            // 匹配_id
            {
              _id: db.RegExp({
                regexp: keyword,
                options: 'i'
              })
            }) : {},
          // 进行中
          {
            state: ComplaintState.Ongoing
          }),
      lastIndex,
      size
    })
  })

  app.router('handle', async (ctx) => {
    const { complaintID, result } = event
    await updateOne({
      name: complaintName,
      id: complaintID,
      data: {
        handling: { time: Date.now(), result },
        state: ComplaintState.Handled
      }
    })

    const complaint = await getOne({ name: complaintName, id: complaintID })

    await cloud.callFunction({
      name: userApi,
      data: {
        $url: 'sendNotification',
        notification: {
          userID: complaint.complainantID,
          content: `你的投诉单 ${complaintID} 已被处理`
        }
      }
    })
  })

  app.router('getOrders', async (ctx) => {
    const { keyword, lastIndex, size } = event

    ctx.body = await getPage({
      name: orderName,
      ccondition: command.and(
        keyword ? command.or(
          {
            goodsName: db.RegExp({
              regexp: keyword,
              options: 'i'
            })
          },
          // 匹配_id
          {
            _id: db.RegExp({
              regexp: keyword,
              options: 'i'
            })
          }) : {}),
      lastIndex,
      size,
    })
  })

  app.router('getCategories', async (ctx) => {
    const res = await cloud.callFunction({
      name: userApi,
      data: {
        $url: event.$url
      }
    })

    const { code, data } = res.result

    if (code !== HttpCode.Success) {
      throw res.result
    }

    ctx.body = data
  })

  app.router('searchGoodsByKeyword', async (ctx) => {
    const { keyword, lastIndex, size } = event

    ctx.body = await getPage({
      name: goodsName,
      condition: command.and(
        keyword ? command.or(
          {
            name: db.RegExp({
              regexp: keyword,
              options: 'i',
            })
          },
          {
            category: {
              name: db.RegExp({
                regexp: keyword,
                options: 'i'
              })
            }
          },
          // 匹配_id
          {
            _id: db.RegExp({
              regexp: keyword,
              options: 'i'
            })
          }) : {},
        { state: GoodsState.InSale }),
      lastIndex,
      size
    })
  })

  app.router('searchGoodsByCategory', async (ctx) => {
    const { $url, categoryID, lastIndex, size } = event

    const res = await cloud.callFunction({
      name: userApi,
      data: {
        $url,
        categoryID,
        lastIndex,
        size
      }
    })

    const { code, data } = res.result

    if (code !== HttpCode.Success) {
      throw res.result
    }

    ctx.body = data
  })

  app.router('deleteGoods', async (ctx) => {
    const { goodsID } = event
    const goods = await getOne({ name: goodsName, id: goodsID })

    await updateOne({ name: goodsName, id: goodsID, data: { state: GoodsState.Deleted } });
    await cloud.callFunction({
      name: userApi,
      data: {
        $url: 'sendNotification',
        userID: goods.sellerID,
        content: `您的商品 ${goods.goodsName} 已被下架，如有疑问请联系管理员`
      }
    })
    // 加入清理计划
    addToDeletePlan(goodsName, goodsID);
  })

  app.router('getUsers', async (ctx) => {
    const { state, keyword, lastIndex, size } = event
    ctx.body = await getPage({
      name: userName,
      condition: command.and(
        keyword ? command.or(
          {
            nickname: db.RegExp({
              regexp: keyword,
              options: 'i'
            })
          },
          // 匹配_id
          {
            _id: db.RegExp({
              regexp: keyword,
              options: 'i'
            })
          }) : {},
        {
          state
        }),
      lastIndex,
      size,
    })
  })

  app.router('updateUser', async (ctx) => {
    const { userID, state } = event

    await updateOne({ name: userName, id: userID, data: { state } })
    await updateAll({
      name: goodsName,
      condition: { sellerID: userID, state: state === UserState.Frozen ? GoodsState.InSale : GoodsState.Frozen },
      data: { state: state === UserState.Frozen ? GoodsState.Frozen : GoodsState.InSale }
    })
  })

  app.router('deleteOrder', async(ctx) => {
    const {orderID} = event;
    if (!orderID) {
      throw new Error('orderID不能为空');
    }

    // get collections
    const orderCollection = db.collection(orderName);
    const goodsCollection = db.collection(goodsName);

    // 查询订单
    const orderDoc = orderCollection.doc(orderID);
     /** @type {import('./index').OrderVO} */
    let order;
    try {
      order = (await orderDoc.get()).data;
    } catch (error) {
      console.log(error);
    }
    if (!order) {
      throw new Error('未找到订单');
    }
    // 查询商品
    const {goodsID, sellerID, buyerID, deliveryTime} = order;
    // 订单送达后不能再人工删除
    if (deliveryTime !== -1) {
      throw new Error('订单已送达，不能删除');
    }
    const goodsDoc =  goodsCollection.doc(goodsID);
    /** @type {import('./index').GoodsVO} */ 
    let goods;
    try {
      goods = (await goodsDoc.get()).data;
    } catch (error) {
      console.log(error);
    }
    if (!goods) {
      throw new Error('商品未找到');
    }
    // 删除订单
    const removeResult = await orderDoc.remove();
    // 更新商品
    /** @type {import('./index').GoodsVO} */
    const goodsUpdateData = {
      state: GoodsState.InSale, // 记得改成在售
      num: command.inc(1),    // 防止并发
    };
    const updateResult = await goodsDoc.update({
      data: goodsUpdateData,
    });

    // 发通知
    cloud.callFunction({
      name: userApi,
      data: {
        $url: 'sendNotification',
        userID: order.sellerID,
        content: `您的订单(编号：${order._id}，买家：${order.buyerName}，商品：${order.goodsName})已被取消，如有疑问请联系管理员`
      }
    });
    cloud.callFunction({
      name: userApi,
      data: {
        $url: 'sendNotification',
        userID: order.buyerID,
        content: `您的订单(编号：${order._id}，卖家：${order.sellerName}，商品：${order.goodsName})已被取消，如有疑问请联系管理员`
      }
    })
  })

  return app.serve()
}

// 数据库操作方法（dao）
const exists = async ({ name, condition = {} }) => {
  const countResult = await db.collection(name).where(condition).count()
  return !!countResult.total
}


const getAll = async ({ name, condition = {}, orders = [], field = {} }) => {
  let query = db.collection(name)
    .where(condition)

  for (const orderPair in orders) {
    query = query.orderBy(orderPair[0], orderPair[1])
  }

  const MAX_LIMIT = 100
  const countResult = await query.count()
  const total = countResult.total
  const batchTimes = Math.ceil(total / MAX_LIMIT)

  let tasks = []

  for (let i = 0; i < batchTimes; i++) {
    const promise = query.skip(i * MAX_LIMIT).limit(MAX_LIMIT).field(field).get();
    tasks.push(promise)
  }

  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return { data: acc.data.concat(cur.data) }
  }, { data: [] }).data
}

const getPage = async ({ name, condition = {}, orders = [], field = {}, lastIndex = 0, size = 1 }) => {
  let query = db.collection(name)
    .where(condition)

  for (const orderPair in orders) {
    query = query.orderBy(orderPair[0], orderPair[1])
  }

  query = query.skip(lastIndex).limit(size).field(field)

  return (await query.get()).data
}

const getOne = async ({ name, id, field = {} }) => {
  return (await db.collection(name)
    .doc(id)
    .field(field)
    .get()).data
}

const add = async ({ name, data }) => {
  return (await db.collection(name)
    .add({
      data
    }))._id
}

const updateAll = async ({ name, condition = {}, data }) => {
  await db.collection(name)
    .where(condition)
    .update({
      data
    })
}

const updateOne = async ({ name, id, data }) => {
  await db.collection(name)
    .doc(id)
    .update({
      data
    })
}

const removeAll = async ({ name, condition = {} }) => {
  await db.collection(name)
    .where(condition)
    .remove()
}

const removeOne = async ({ name, id }) => {
  await db.collection(name)
    .doc(id)
    .remove()
}

// 枚举
const UserState = {
  UnRegistered: 0, // 未注册
  Normal: 1,
  Frozen: 2, // 被管理员冻结
}

const GoodsState = {
  InSale: 0,
  Deleted: 1,
  Paying: 2,
  Frozen: 3
}

const OrderState = {
  Ongoing: 0,
  Finished: 1,
  Paying: -1 // 正在支付中 by eric
}

const ComplaintState = {
  Ongoing: 0,
  Handled: 1
}

const HttpCode = {
  Success: 200,
  Forbidden: 403, // 403
  Not_Found: 404, // 404
  Conflict: 409, // 409 冲突
  Fail: 500 // 500
}

/**
 * 加入清理计划
 * @param {string} collectionName 
 * @param {string} id 
 */
const addToDeletePlan = async (collectionName, id) => {
  try {
    const result = await cloud.callFunction("addToDeleteQueue", {
      collectionName,
      id
    });
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};