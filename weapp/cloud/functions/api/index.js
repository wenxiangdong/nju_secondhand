// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
const fs = require("fs");
const Tenpay = require("tenpay");
const { LitePay, utils, Bank } = require("@sigodenjs/wechatpay");
const BigNumber = require('bignumber.js')

cloud.init()

const db = cloud.database()
const command = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.use(async (ctx, next) => {
    console.log("----------> 进入api")
    ctx.data = {}

    await next();
    console.log("----------> 退出api")
  })

  // 取得自身信息
  app.router('*', async (ctx, next) => {
    console.log(`invoke: ${event.$url}`)

    const openid = cloud.getWXContext().OPENID
    ctx.data.openid = openid
    console.log(openid)
    ctx.data.self = await login({ openid })

    await next()
  })

  // 检查部分接口权限
  app.router(['publishGoods', 'getOngoingGoods', 'deleteGoods', 'purchase',
    'publishPost', 'getPosts', 'comment', 'getPostById', 'searchPostsByKeyword',
    'complain', 'getComplaints',
    'getNotifications',
    'accept', 'getBuyerOrders', 'getSellerOrders',
  ], async (ctx, next) => {
    if (ctx.data.self.state !== UserState.Normal) {
      ctx.body = {
        code: HttpCode.Forbidden,
        message: '帐号异常'
      }
    } else {
      await next()
    }
  })

  /** 用户 */
  app.router('checkState', async (ctx) => {
    ctx.body = {
      code: HttpCode.Success,
      data: ctx.data.self.state || UserState.UnRegistered
    }
  })

  app.router('login', async (ctx) => {
    ctx.body = {
      code: HttpCode.Success,
      data: ctx.data.self
    }
  })

  app.router('getUserInfo', async (ctx) => {
    ctx.body = {
      code: HttpCode.Success,
      data: await getOneUser({ userID: event.userID })
    }
  })

  /** 商品 */
  app.router('getCategories', async (ctx) => {
    ctx.body = {
      code: HttpCode.Success,
      data: await getAllCategory()
    }
  })

  app.router('getGoods', async (ctx) => {
    ctx.body = {
      code: HttpCode.Success,
      data: await getOneGoods({ goodsID })
    }
  })

  app.router('searchGoodsByKeyword', async (ctx) => {
    const { keyword, lastIndex, size } = event
    ctx.body = {
      code: HttpCode.Success,
      data: await searchGoodsByKeyword({ keyword, lastIndex, size })
    }
  })

  app.router('searchGoodsByCategory', async (ctx) => {
    const { categoryID, lastIndex, size } = event
    ctx.body = {
      code: HttpCode.Success,
      data: await searchGoodsByCategory({ categoryID, lastIndex, size })
    }
  })

  app.router('getGoodsWithSeller', async (ctx) => {
    const goods = await getOneGoods({ goodsID: event.goodsID })
    const seller = await getOneUser({ userID: goods.sellerID })
    ctx.body = {
      code: HttpCode.Success,
      data: { goods, seller }
    }
  })

  app.router('searchGoodsWithSellerByKeyword', async (ctx) => {
    const { keyword, lastIndex, size } = event
    const goodsList = await searchGoodsByKeyword({ keyword, lastIndex, size })
    const sellers = await Promise.all(goodsList.map(goods => getOneUser({ userID: goods.sellerID })))

    ctx.body = {
      code: HttpCode.Success,
      data: goodsList.map((goods, index) => { return { goods, seller: sellers[index] } })
    }
  })

  app.router('searchGoodsWithSellerByCategory', async (ctx) => {
    const { categoryID, lastIndex, size } = event
    const goodsList = await searchGoodsByCategory({ categoryID, lastIndex, size })
    const sellers = await Promise.all(goodsList.map(goods => getOneUser({ userID: goods.sellerID })))

    ctx.body = {
      code: HttpCode.Success,
      data: goodsList.map((goods, index) => { return { goods, seller: sellers[index] } })
    }
  })

  app.router('publishGoods', async (ctx) => {
    const { goods } = event
    const { self } = ctx.data

    goods.sellerID = self._id
    goods.sellerName = self.nickname

    goods.state = GoodsState.InSale

    goods.category = await getOneCategory({ categoryID: goods.categoryID })
    delete goods.categoryID

    await addGoods({ goods })

    ctx.body = {
      code: HttpCode.Success
    }
  })

  app.router('getOngoingGoods', async (ctx) => {
    ctx.body = {
      code: HttpCode.Success,
      data: await getGoodsByUserIdAndState({ userID: ctx.data.self._id, state: command.eq(GoodsState.InSale).or(command.eq(GoodsState.Paying)) })
    }
  })

  app.router('deleteGoods', async (ctx) => {
    const { goodsID } = event
    await updateOneGoods({ goodsID, goods: { state: GoodsState.Deleted } })

    ctx.body = {
      code: HttpCode.Success
    }
  })

  app.router('purchase', async (ctx) => {
    const { goodsID = -1 } = event;
    const { self } = ctx.data;

    // 对商品下单：商品下架、创建订单
    const goods = await getOneGoods({ goodsID })

    if (goods.state !== GoodsState.InSale) {
      ctx.body = { code: HttpCode.Fail, messsage: '该商品暂时无法购买' }
    }

    if (goods.num <= 0) {
      ctx.body = {
        code: HttpCode.Fail,
        message: '该商品已无存货'
      }
    }

    if (goods.num === 1) {
      await updateOneGoods({
        goodsID, goods: { num: command.inc(-1), state: OrderState.Deleted }
      })
    } else {
      await updateOneGoods({
        goodsID, goods: { num: command.inc(-1) }
      })
    }

    const order = {
      // buyer就是当前用户
      buyerID: self._id,
      buyerName: self.nickname,
      // seller的信息其实都在 goods中
      sellerID: goods.sellerID,
      sellerName: goods.sellerName,

      goodsID: goods._id,
      goodsName: goods.name,
      goodsPrice: goods.price,

      address: self.address,

      deliveryTime: -1, // -1 表示还未送达

      state: OrderState.Paying
    };
    // 这里插失败都要回滚，将商品的信息改回来 
    try {
      order._id = await addOrder({ order })
      console.log("插入的order", order);
    } catch (error) {
      // 放着异步做了，无力的保证
      console.error(error);
      await updateOneGoods({
        goodsID, goods: { state: GoodsState.InSale, num: command.inc(1) }
      })
      ctx.body = {
        code: HttpCode.Fail,
        message: "下单失败，请重试"
      };
      return;
    }
    // 调用支付
    try {
      const result = await pay({
        /**
         * 参数
         * payTitle 支付的标题，例“商品xxx”
         * payAmount 支付的金额
         * orderID 要保证唯一性，此笔交易的id
         */
        openID: ctx.data.openid,
        payTitle: goods.name,
        payAmount: goods.price,
        orderID: order._id,
      });
      result.orderID = order._id
      // 调用云函数是否正常
      ctx.body = {
        code: HttpCode.Success,
        data: result
      };
    } catch (error) {
      console.error(error)
      await deleteOneOrder({ orderID: order._id })
      await updateOneGoods({
        goodsID, goods: { state: GoodsState.InSale, num: command.inc(1) }
      })
      ctx.body = {
        code: HttpCode.Fail,
        message: "微信支付服务出错"
      }
    }
  })

  /** 圈子 */
  app.router('publishPost', async (ctx) => {
    const { self } = ctx.data
    const { post } = event

    post.ownerID = self._id
    post.ownerName = self.nickname
    post.ownerAvatar = self.avatar

    post.comments = []

    await addPost({ post });

    ctx.body = { code: HttpCode.Success }
  })

  app.router('getPosts', async (ctx) => {
    const { lastIndex, size } = event
    ctx.body = {
      code: HttpCode.Success,
      data: await getPostsByPageAndKeyword({ lastIndex, size })
    }
  })

  app.router('comment', async (ctx) => {
    const { postID, content } = event
    const { self } = ctx.data

    await updateOnePost({
      postID,
      post: {
        comments: command.push([{ nickname: self.nickname, content, commentTime: Date.now() }])
      }
    })

    ctx.body = { code: HttpCode.Success }
  })

  app.router('getPostById', async (ctx) => {
    ctx.body = {
      code: HttpCode.Success,
      data: await getOnePost({ postID: event.postId })
    }
  })

  app.router('searchPostsByKeyword', async (ctx) => {
    const {
      keyword, lastIndex, size
    } = event;

    ctx.body = {
      code: HttpCode.Success,
      data: await getPostsByPageAndKeyword({
        keyword, lastIndex, size
      })
    }
  })

  /** 投诉 */
  app.router('complain', async (ctx) => {
    const { complaint } = event
    const { self } = ctx.data

    complaint.complainantID = self._id
    complaint.complainantName = self.nickname

    complaint.state = ComplaintState.Ongoing

    await addComplaint({ complaint })

    ctx.body = { code: HttpCode.Success }
  })

  // 逆序取得投诉列表
  app.router('getComplaints', async (ctx) => {
    const { lastIndex, size } = event
    const { self } = ctx.data

    ctx.body = {
      code: HttpCode.Success,
      data: await getComplaintsByPageAndUserId({ userID: self._id, lastIndex, size })
    }
  })

  /** 系统消息 */
  // 逆序取得系统消息
  app.router('getNotifications', async (ctx) => {
    const { lastIndex, size } = event
    const { self } = ctx.data

    ctx.body = {
      data: await getNotificationsByPageAndUserId({ userID: self._id, lastIndex, size }),
      code: HttpCode.Success
    }
  })

  app.router('sendNotification', async (ctx) => {
    await addNotification({ notification: event.notification })

    ctx.body = { code: HttpCode.Success }
  })

  /** 账户 */
  app.router('withdraw', async (ctx) => {
    const { self } = ctx.data;
    let { amount } = event;

    // 前置检查余额
    const { account = {} } = self || {};
    let { balance = 0 } = account;
    amount = BigNumber(amount);
    balance = BigNumber(balance);
    if (balance.toNumber() < amount.toNumber()) {
      ctx.body = {
        code: HttpCode.Fail,
        message: "账户余额不足"
      }
      return;
    }

    const taxes = amount.multipliedBy(0.01).toFixed(2).toNumber()
    if (taxes < 1) {
      taxes = 1
    }
    if (taxes > amount.toNumber()) {
      taxes = amount.toNumber()
    }
    balance = balance.minus(amount)
    amount = amount.minus(taxes)

    // 微信企业付款
    try {
      await withdraw({
        openID: ctx.data.openid,
        amount: amount.toNumber()
      });
    } catch (error) {
      ctx.body = error;
      return;
    }

    // 更新数据库
    await updateOneUser({
      userID: self._id,
      user: {
        account: {
          balance: balance.toFixed(2)
        }
      }
    })

    ctx.body = { code: HttpCode.Success }
  })

  /** 订单 */
  app.router('accept', async (ctx) => {
    const {
      /** @type {string} */
      orderID
    } = event; // 这里cst写的是ctx.event, 改正 by eric

    const order = await getOneOrder({ orderID })

    console.log(order);

    try {
      await udpateOneOrder({ orderID, order: { state: OrderState.Finished, deliveryTime: Date.now() } })
    } catch (e) {
      console.error(e)
      ctx.body = { code: HttpCode.Fail, message: '接受订单失败，请重试' }
      return
    }

    try {
      let user = await getOneUser({ userID: order.sellerID });
      console.log(user);
      if (user) {
        const balance = BigNumber(user.account.balance).plus(order.goodsPrice).toFixed(2);
        user.account.balance = balance;
        delete user._id;
        console.log(user.account.balance, order.goodsPrice, balance);
        await updateOneUser({ userID: order.sellerID, user: { account: { balance } } });
      }
    } catch (e) {
      console.error(e);
      // 如果更新卖家消息失败，回滚订单操作，将其改为进行中状态
      await udpateOneOrder({ orderID, order: { state: OrderState.Ongoing, deliveryTime: -1 } })
      ctx.body = { code: HttpCode.Fail, message: '接受订单失败，请重试' }
      return
    }

    await addNotification({ notification: { userID: order.sellerID, content: `您的商品【${order.goodsName}】已被签收` } })

    ctx.body = { code: HttpCode.Success }
  })

  // 逆序
  app.router('getBuyerOrders', async (ctx) => {
    const { state, lastIndex, size } = event

    ctx.body = {
      code: HttpCode.Success,
      data: await getBuyerOrdersByPageAndState({ buyerID: ctx.data.self._id, state, lastIndex, size })
    }
  })

  // 逆序
  app.router('getSellerOrders', async (ctx) => {
    const { state, lastIndex, size } = event

    ctx.body = {
      code: HttpCode.Success,
      data: await getSellerOrdersByPageAndState({ sellerID: ctx.data.self._id, state, lastIndex, size })
    }
  })

  app.router('getOrderById', async (ctx) => {
    ctx.body = {
      code: HttpCode.Success,
      data: await getOneOrder({ orderID: event.orderId })
    }
  })

  app.router('orderCallback', async (ctx) => {
    const {
      orderID = undefined, result = undefined
    } = event;
    // 处理函数
    const handlers = {
      '0': async (order) => {
        await udpateOneOrder({ orderID: order._id, order: { state: OrderState.Ongoing } })
        // await updateOneGoods({ goodsID: order.goodsID, goods: { state: GoodsState.Deleted } })
        // 通知卖家发货
        await addNotification({ notification: { userID: order.sellerID, content: `您的商品【${order.goodsName}】已被购买，请及时发货` } })
      },
      '-1': async (order) => {
        // 删除订单
        // 就算出错了也没有太多关系，放着异步
        await deleteOneOrder({ orderID: order._id })
        // 上架商品
        // 一定要重新上架成功，否则得报错
        await updateOneGoods({ goodsID: order.goodsID, goods: { state: GoodsState.InSale, num: command.inc(1) } })
      }
    };

    const NOT_FOUND = {
      code: HttpCode.Not_Found,
      message: "未找到订单"
    };

    // 检查参数
    if (orderID === undefined || result === undefined) {
      ctx.body = NOT_FOUND;
      return
    }

    // 查询订单
    const order = await getOneOrder({ orderID })
    if (!order) {
      ctx.body = NOT_FOUND;
      return
    }

    // 检查订单状态，这里只处理支付中的订单
    if (order.state !== OrderState.Paying) {
      ctx.body = {
        code: HttpCode.Conflict,
        message: "该订单已经不处于支付中状态"
      };
      return
    }

    // 处理
    const handler = handlers[result];
    try {
      await handler(order);
    } catch (error) {
      console.error(error);
      ctx.body = {
        code: HttpCode.Fail,
        message: `订单[${order._id}]处理失败，请重试，或者联系客服`
      }
      return
    }

    ctx.body = {
      code: HttpCode.Success
    }
  })

  /** 消息 */
  app.router('addMessage', async (ctx) => {
    const { message } = event
    const sender = await getOneUser({ userID: message.senderID })
    const receiver = await getOneUser({ userID: message.receiverID })

    message.senderName = sender.nickname
    message.receiverName = receiver.nickname
    message.read = false
    const messageID = await addMessage({ message })
    ctx.body = await getOneMessage({ messageID })
  })

  app.router('readMessage', async (ctx) => {
    const { messageID } = event
    await updateOneMessage({ messageID, message: { read: true } })
  })

  app.router('getUnreadMessages', async (ctx) => {
    const { receiverID } = event
    ctx.body = await getMessagesByReceiverIdAndRead({ receiverID })
  })

  return app.serve()
}

// (service)
/** user */
const userName = 'user'

const login = async ({ openid }) => {
  return (await getPage({
    name: userName,
    condition: {
      _openid: openid
    },
    field: {
      _openid: false
    }
  }))[0] || {}
}

const getOneUser = async ({ userID }) => {
  return await getOne({ name: userName, id: userID, field: { _openid: false } })
}

const updateOneUser = async ({ userID, user }) => {
  await updateOne({ name: userName, id: userID, data: user })
}

/** goods */
const goodsName = 'goods'
const categoryName = 'category'

const getOneGoods = async ({ goodsID }) => {
  return await getOne({ name: goodsName, id: goodsID })
}

const getOneCategory = async ({ categoryID }) => {
  return await getOne({ name: categoryName, id: categoryID })
}

const getAllCategory = async () => {
  return await getAll({ name: categoryName })
}

const searchGoodsByKeyword = async ({ keyword, lastIndex, size }) => {
  return await getPage({
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
        }
      ) : {},
      { state: GoodsState.InSale }),
    lastIndex,
    size
  })
}

const searchGoodsByCategory = async ({ categoryID, lastIndex, size }) => {
  return await getPage({
    name: goodsName,
    condition: {
      category: {
        _id: categoryID
      },
      state: GoodsState.InSale
    },
    lastIndex,
    size
  })
}

const getGoodsByUserIdAndState = async ({ userID, state }) => {
  return await getAll({
    name: goodsName, condition: {
      sellerID: userID,
      state
    }
  })
}

const addGoods = async ({ goods }) => {
  goods.publishTime = Date.now()
  return await add({ name: goodsName, data: goods })
}

const deleteOneGoods = async ({ goodsID }) => {
  await removeOne({ name: goodsName, id: goodsID })
}

const updateOneGoods = async ({ goodsID, goods }) => {
  await updateOne({ name: goodsName, id: goodsID, data: goods })
}

/** order */
const orderName = 'order'

const getOneOrder = async ({ orderID }) => {
  return await getOne({ name: orderName, id: orderID })
}

const getBuyerOrdersByPageAndState = async ({ buyerID, state, lastIndex, size }) => {
  return await getPage({
    name: orderName,
    condition: {
      buyerID,
      state
    },
    orders: [['orderTime', 'desc']],
    lastIndex,
    size
  })
}

const getSellerOrdersByPageAndState = async ({ sellerID, state, lastIndex, size }) => {
  return await getPage({
    name: orderName,
    condition: {
      sellerID,
      state,
    },
    orders: [['orderTime', 'desc']],
    lastIndex,
    size
  })
}

const addOrder = async ({ order }) => {
  order.orderTime = Date.now()
  return await add({ name: orderName, data: order })
}

const deleteOneOrder = async ({ orderID }) => {
  return await removeOne({ name: orderName, id: orderID })
}

const udpateOneOrder = async ({ orderID, order }) => {
  await updateOne({ name: orderName, id: orderID, data: order })
}

/** post */
const postName = 'post'

const getOnePost = async ({ postID }) => {
  return await getOne({ name: postName, id: postID })
}

const getPostsByPageAndKeyword = async ({ keyword = '', lastIndex, size }) => {
  return await getPage({
    name: postName,
    condition:
      keyword ? command.or(
        {
          topic: db.RegExp({
            regexp: keyword,
            options: 'i',
          })
        },
        {
          desc: db.RegExp({
            regexp: keyword,
            options: 'i',
          })
        }) : {},
    lastIndex,
    orders: [['publishTime', 'desc']],
    size
  })
}

const addPost = async ({ post }) => {
  post.publishTime = Date.now()
  return await add({ name: postName, data: post })
}

const updateOnePost = async ({ postID, post }) => {
  await updateOne({ name: postName, id: postID, data: post })
}

/** complaint */
const complaintName = 'complaint'

const getComplaintsByPageAndUserId = async ({ userID, lastIndex, size }) => {
  return await getPage({ name: complaintName, condition: { complainantID: userID }, orders: [['complainTime', 'desc']], lastIndex, size })
}

const addComplaint = async ({ complaint }) => {
  complaint.complainTime = Date.now()

  return await add({ name: complaintName, data: complaint })
}


/** notification */
const notificationName = 'notification'

const getNotificationsByPageAndUserId = async ({ userID, lastIndex, size }) => {
  return await getPage({ name: notificationName, condition: { userID }, orders: [['time', 'desc']], lastIndex, size })
}

const addNotification = async ({ notification }) => {
  notification.time = Date.now()
  notification.read = false;  // 加一句 未读标记
  add({ name: notificationName, data: notification })
}

/** account */
const withdraw = async ({ openID = "", amount = 0 }) => {
  console.log(TENPAY_CONFIG);
  const tenpay = new Tenpay(TENPAY_CONFIG, true);
  // 转换成分
  amount = BigNumber(amount).multipliedBy(100).integerValue().toNumber();
  try {
    const info = {
      // todo 转账
      partner_trade_no: `${openID.substring(0, 10)}${+ new Date()}`,
      openid: openID,
      check_name: 'NO_CHECK',
      amount: amount,
      desc: '南大小书童提现'
    };
    console.log(info);
    await tenpay.transfers(info);
  } catch (error) {
    console.error(error);
    throw {
      code: HttpCode.Fail,
      message: "提现出错，若账户出现问题，请联系客服或填写投诉单"
    }
  }
}

const pay = async ({ openID, payTitle = "南大小书童闲置物品", payAmount = 0, orderID = "" }) => {
  console.log(TENPAY_CONFIG);
  const tenpay = new Tenpay(TENPAY_CONFIG, true);
  // 转换成分
  payAmount = BigNumber(payAmount).multipliedBy(100).integerValue().toNumber();
  try {
    const result = await tenpay.getPayParams({
      out_trade_no: orderID || `order${+new Date()}`,
      body: payTitle,
      total_fee: payAmount, //订单金额(分),
      openid: openID,
    });
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
    throw {
      code: HttpCode.Fail,
      message: "预下单失败"
    };
  }
}

/** message */
const messageName = 'message'

const getOneMessage = async ({ messageID }) => {
  return await getOne({ name: messageName, id: messageID })
}

const getMessagesByReceiverIdAndRead = async ({ receiverID, read = false }) => {
  const messages = await getAll({
    name: messageName,
    condition: {
      receiverID,
      read
    },
  })
  const ids = messages.map(message => message._id)
  await updateAll({ name: messageName, condition: { _id: command.in(ids) }, data: { read: true } })
  return messages
}

const addMessage = async ({ message }) => {
  message.time = Date.now()

  return await add({ name: messageName, data: message })
}

const updateOneMessage = async ({ messageID, message }) => {
  await updateOne({
    name: messageName,
    id: messageID,
    data: message
  })
}

// 数据库操作方法（dao）
const getAll = async ({ name, condition = {}, orders = [], field = {} }) => {
  let query = db.collection(name)
    .where(condition)

  for (const orderPair of orders) {
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

  for (const orderPair of orders) {
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

const APP_CONFIG = {
  APP_ID: "wxc4e156082fbd97ba",
  APP_SECRET: "b67831c61b8af414d031fe209a30c683",
  ACCOUNT: "1521513131",
  KEY: "NanjingdunshudianzishangwuYXXL18",
  CERT: fs.readFileSync(`${__dirname}/cert.p12`),
};

const TENPAY_CONFIG = {
  appid: APP_CONFIG.APP_ID,
  mchid: APP_CONFIG.ACCOUNT,
  partnerKey: APP_CONFIG.KEY,
  pfx: APP_CONFIG.CERT,
  notify_url: "https://wenxiangdong.github.io",
  spbill_create_ip: "127.0.0.1"
}