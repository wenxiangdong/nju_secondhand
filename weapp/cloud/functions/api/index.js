// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
const fs = require("fs");
const Tenpay = require("tenpay");
const { LitePay, utils, Bank } = require("@sigodenjs/wechatpay");

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
    const openid = cloud.getWXContext().OPENID
    ctx.data.openid = openid
    console.log(openid)
    ctx.data.self = await login({ openid })
    console.log(ctx.data.self)

    await next()
  })

  // 检查部分接口权限
  app.router(['publishGoods', 'getOngoingGoods', 'deleteGoods', 'purchase',
    'publishPost', 'getPosts', 'comment', 'getPostById', 'searchPostsByKeyword',
    'complain', 'getComplaints',
    'getNotifications',
    'accept', 'getBuyerOrders', 'getSellerOrders'], async (ctx, next) => {
      if (ctx.data.self.state !== User.Normal) {
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
      data: await getUserInfo({ userID: event.userID })
    }
  })

  /** 商品 */
  app.router('getCategories', async (ctx) => {
    ctx.body = {
      code: HttpCode.Success,
      data: await getAll({ name: 'category' })
    }
  })

  app.router('getGoods', async (ctx) => {
    ctx.body = {
      code: HttpCode.Success,
      data: await getOne({
        name: 'goods',
        id: event.goodsID
      })
    }
  })

  app.router('searchGoodsByKeyword', async (ctx) => {
    const { keyword, lastIndex, size, timestamp } = event
    ctx.body = {
      code: HttpCode.Success,
      data: await searchGoodsByKeyword({ keyword, lastIndex, size, timestamp })
    }
  })

  app.router('searchGoodsByCategory', async (ctx) => {
    const { categoryID, lastIndex, size, timestamp } = event
    ctx.body = {
      code: HttpCode.Success,
      data: await searchGoodsByCategory({ categoryID, lastIndex, size, timestamp })
    }
  })

  app.router('getGoodsWithSeller', async (ctx) => {
    const goods = await getOne({ name: 'goods', id: event.goodsID })
    const seller = await getUserInfo({ userID: goods.sellerID })
    ctx.body = {
      code: HttpCode.Success,
      data: { goods, seller }
    }
  })

  app.router('searchGoodsWithSellerByKeyword', async (ctx) => {
    const { keyword, lastIndex, size, timestamp } = event
    const goodsList = await searchGoodsByKeyword({ keyword, lastIndex, size, timestamp })
    const goodsWithSellers = []
    for (const goods of goodsList) {
      const seller = await getUserInfo({ userID: goods.sellerID })
      goodsWithSellers.push({
        goods,
        seller
      })
    }

    ctx.body = {
      code: HttpCode.Success,
      data: goodsWithSellers
    }
  })

  app.router('searchGoodsWithSellerByCategory', async (ctx) => {
    const { categoryID, lastIndex, size, timestamp } = event
    const goodsList = await searchGoodsByCategory({ categoryID, lastIndex, size, timestamp })
    const goodsWithSellers = []
    for (const goods of goodsList) {
      const seller = await getUserInfo({ userID: goods.sellerID })
      goodsWithSellers.push({
        goods,
        seller
      })
    }

    ctx.body = {
      code: HttpCode.Success,
      data: goodsWithSellers
    }
  })

  app.router('publishGoods', async (ctx) => {
    const { goods } = event
    const { self } = ctx.data

    goods.sellerID = self.sellerID
    goods.sellerName = self.nickname

    goods.publishTime = Date.now()
    goods.state = GoodsState.InSale

    goods.category = await getOne({ name: 'category', id: goods.categoryID })
    delete goods.categoryID

    await add({ name: 'goods', data: goods })

    ctx.body = {
      code: HttpCode.Success
    }
  })

  app.router('getOngoingGoods', async (ctx) => {
    ctx.body = {
      code: HttpCode.Success,
      data: await getAll({
        name: 'goods', condition: {
          sellerID: ctx.data.self._id,
          state: GoodsState.InSale
        }
      })
    }
  })

  app.router('deleteGoods', async (ctx) => {
    await removeOne({ name: 'goods', id: event.goodsID })

    ctx.body = {
      code: HttpCode.Success
    }
  })

  app.router('purchase', async (ctx) => {
    const { goodsID = -1 } = event;
    const { self } = ctx.data;

    // 对商品下单，创建订单和让商品下架
    await updateOne({
      name: 'goods',
      id: goodsID,
      data: {
        state: GoodsState.Deleted
      }
    })


    // 下个单
    // const goods = goodsList[0]; // 取goods
    const goods = getOne({ name: 'goods', id: goodsID })
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

      orderTime: Date.now(),
      deliveryTime: -1, // -1 表示还未送达

      state: OrderState.Paying
    };
    // 这里插失败都要回滚，将商品的信息改回来 
    try {
      order._id = await add({ name: 'order', data: order })
      console.log("插入的order", order);
    } catch (error) {
      // 放着异步做了，无力的保证
      console.error(error);
      await updateOne({
        name: 'goods',
        id: goodsID,
        data: {
          state: GoodsState.InSale
        }
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
        payAmount: order.price,
        orderID: order._id,
      });
      // 调用云函数是否正常
      ctx.body = {
        code: result.code,
        data: {
          ...result.data,
          orderID: order._id
        }
      };
    } catch (error) {
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

    post.publishTime = Date.now()
    post.comments = []

    await add({ name: 'post', data: post });

    ctx.body = { code: HttpCode.Success }
  })

  app.router('getPosts', async (ctx) => {
    const { lastIndex, size, timestamp } = event
    ctx.body = {
      code: HttpCode.Success,
      data: await getPage({ name: 'post', condition: { publishTime: command.lte(timestamp) }, lastIndex, size })
    }
  })

  app.router('comment', async (ctx) => {
    const { postID, content } = event
    const { self } = ctx.data

    await updateOne({
      name: 'post',
      id: postID,
      data: {
        comments: command.push([{
          nickname: self.nickname,
          content,
          commentTime: Date.now()
        }])
      }
    })

    ctx.body = {
      code: HttpCode.Success
    }
  })

  app.router('getPostById', async (ctx) => {
    ctx.body = {
      code: HttpCode.Success,
      data: await getOne({ name: 'post', id: event.postId })
    }
  })

  app.router('searchPostsByKeyword', async (ctx) => {
    const {
      keyword,
      lastIndex,
      size,
      timestamp
    } = event;

    ctx.body = {
      code: HttpCode.Success,
      data: await getPage({
        name: 'post',
        condition: keyword ? {
          topic: db.RegExp({
            regexp: keyword,
            options: 'i',
          }),
          publishTime: command.lte(timestamp)
        } : { publishTime: command.lte(timestamp) },
        lastIndex,
        size
      })
    }
  })

  /** 投诉 */
  app.router('complain', async (ctx) => {
    const { complaint } = event
    const { self } = ctx.data

    complaint.complaintID = self._id
    complaint.complaintName = self.nickName

    complaint.complainTime = Date.now()

    complaint.state = ComplaintState.Ongoing

    await add({ name: 'complaint', data: complaint })

    ctx.body = {
      code: HttpCode.Success
    }
  })

  // 逆序取得投诉列表
  app.router('getComplaints', async (ctx) => {
    const { lastIndex, size } = event
    const { self } = ctx.data

    ctx.body = {
      data: result.data,
      code: await getPage({ name: 'complaint', condition: { complaintID: self._id }, orders: ['complainTime', 'desc'], lastIndex, size })
    }
  })

  /** 系统消息 */
  // 逆序取得系统消息
  app.router('getNotifications', async (ctx) => {
    const { lastIndex, size, timestamp } = event
    const { self } = ctx.data

    ctx.body = {
      data: await getPage({ name: 'notification', condition: { userID: self._id, time: command.lte(timestamp) }, orders: [['time', 'desc']], lastIndex, size }),
      code: HttpCode.Success
    }
  })

  app.router('sendNotification', async (ctx) => {
    await sendNotification(...event.notification)

    ctx.body = {
      code: HttpCode.Success
    }
  })

  /** 账户 */
  app.router('withdraw', async (ctx) => {
    const { self } = ctx.data;
    let { amount } = event;

    // 前置检查余额
    const { account = {} } = self || {};
    let { balance = 0 } = account;
    amount = parseFloat(amount);
    balance = parseFloat(balance);
    if (balance < amount) {
      ctx.body = {
        code: HttpCode.Forbidden,
        message: "账户余额不足"
      }
      return;
    }

    // 微信企业付款
    try {
      await withdraw({
        openID: ctx.data.openid,
        amount: amount
      });
    } catch (error) {
      ctx.body = error;
      return;
    }

    // 更新数据库
    await updateOne({
      name: 'user',
      id: self._id,
      data: {
        account: {
          balance: (balance - amount) + ''
        }
      }
    })

    ctx.body = {
      code: HttpCode.Success
    }
  })

  /** 订单 */
  app.router('accept', async (ctx) => {
    const {
      orderID
    } = ctx.event;

    const order = await getOne({ name: 'order', id: orderID })

    const account = (await getOne({ name: 'user', id: order.sellerID, field: { account: true } })).account

    await Promise.all(
      [
        updateOne({ name: 'order', id: orderID, data: { state: OrderState.Finished, deliveryTime: Date.now() } }),
        updateOne({ name: 'user', id: order.sellerID, data: { account } }),
        sendNotification({ userID: order.sellerID, content: `您的订单 ${order._id} 已被签收` })
      ]
    )

    ctx.body = {
      code: HttpCode.Success
    }
  })

  // 逆序
  app.router('getBuyerOrders', async (ctx) => {
    const { state, lastIndex, size, timestamp } = event

    ctx.body = {
      code: HttpCode.Success,
      data: await getPage({
        name: 'order',
        condition: {
          buyerID: ctx.data.self._id,
          state,
          orderTime: command.lte(timestamp)
        },
        orders: [['orderTime', 'desc']],
        lastIndex,
        size
      })
    }
  })

  // 逆序
  app.router('getSellerOrders', async (ctx) => {
    const { state, lastIndex, size, timestamp } = event

    ctx.body = {
      code: HttpCode.Success,
      data: await getPage({
        name: 'order',
        condition: {
          sellerID: ctx.data.self._id,
          state,
          orderTime: command.lte(timestamp)
        },
        orders: [['orderTime', 'desc']],
        lastIndex,
        size
      })
    }
  })

  app.router('getOrderById', async (ctx) => {
    ctx.body = {
      code: HttpCode.Success,
      data: await getOne({ name: 'order', id: event.orderId })
    }
  })

  app.router('orderCallback', async (ctx) => {
    const {
      orderID = undefined, result = undefined
    } = event;
    // 处理函数
    const handlers = {
      '0': async (order) => {
        await updateOne({ name: 'order', id: order._id, data: { state: OrderState.Ongoing } })
      },
      '-1': async (order) => {
        // 删除订单
        // 就算出错了也没有太多关系，放着异步
        await removeOne({ name: 'order', id: order._id })
        // 上架商品
        // 一定要重新上架成功，否则得报错
        await updateOne({ name: 'goods', id: order.goodsID, data: { state: GoodsState.InSale } })
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
    const order = await getOne({ name: 'order', id: orderID })
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
    }

    ctx.body = {
      code: HttpCode.Success
    }
  })

  return app.serve()
}

// (service)
const login = async ({ openid }) => {
  return (await getPage({
    name: 'user',
    condition: {
      _openid: openid
    },
    field: {
      _openid: false
    }
  }))[0] || {}
}

const getUserInfo = async ({ userID }) => {
  return await getOne({ name: 'user', id: userID, field: { _openid: false } })
}

const searchGoodsByKeyword = async ({ keyword, lastIndex, size, timestamp }) => {
  return await getPage({
    name: 'goods',
    condition: keyword ?
      command.or(
        [{
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
        }]).and({ state: GoodsState.InSale, publishTime: command.lte(timestamp) })
      :
      { state: GoodsState.InSale, publishTime: command.lte(timestamp) },
    lastIndex,
    size
  })
}

const searchGoodsByCategory = async ({ categoryID, lastIndex, size, timestamp }) => {
  return await getPage({
    name: 'goods',
    condition: {
      category: {
        _id: categoryID
      }, state: GoodsState.InSale, publishTime: command.lte(timestamp)
    },
    lastIndex,
    size
  })
}

const sendNotification = async ({ userID, content }) => {
  await add({ name: 'notification', data: { userID, content, time: Date.now() } })
}

const withdraw = async ({ openID = "", amount = 0 }) => {
  console.log(TENPAY_CONFIG);
  const tenpay = new Tenpay(TENPAY_CONFIG, true);
  // 转换成分
  amount = parseFloat(amount);
  amount = amount * 100;
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
  payAmount = parseFloat(payAmount);
  payAmount = payAmount * 100;
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

// 数据库操作方法（dao）
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
  Deleted: 1
}

const OrderState = {
  Ongoing: 0,
  Finished: 1,
  Paying: -1 // 正在支付中 by eric
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
  CERT: fs.readFileSync('cert.p12'),
};

const TENPAY_CONFIG = {
  appid: APP_CONFIG.APP_ID,
  mchid: APP_CONFIG.ACCOUNT,
  partnerKey: APP_CONFIG.KEY,
  pfx: APP_CONFIG.CERT,
  notify_url: "https://wenxiangdong.github.io",
  spbill_create_ip: "127.0.0.1"
}