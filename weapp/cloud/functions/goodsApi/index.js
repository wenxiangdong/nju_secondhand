// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRounter = require('tcb-router')

cloud.init()

const db = cloud.database()

const command = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRounter({
    event
  })

  app.use(async (ctx, next) => {
    console.log('----------> 进入 goodsApi 全局中间件')
    ctx.data = {}
    ctx.data.openid = cloud.getWXContext().OPENID
    ctx.data.categoryCollection = db.collection('category')
    ctx.data.goodsCollection = db.collection('goods')

    await next();
    console.log('----------> 退出 goodsApi 全局中间件')
  })

  app.router(['publishGoods', 'getOngoingGoods', 'deleteGoods',
    'purchase'
  ], async (ctx, next) => {
    let self = await cloud.callFunction('userApi', {
      $url: 'getNormalSelf',
      openid: ctx.data.openid
    }).result;
    ctx.data.self = JSON.parse(self);

    await next();
  })

  app.router('getCategories', async (ctx) => {
    let categories = [];
    let skip = 0;
    const limit = 20;

    let data;
    while (data = (await ctx.data.categoryCollection
      .skip(skip)
      .limit(limit)
      .get())
      .data) {

      categories = categories.concat(data);

      if (data.length < limit) {
        break;
      }

      skip += limit;
    }

    ctx.body = categories;
  })

  app.router('searchGoodsByKeyword', async (ctx) => {
    let result = await ctx.data.goodsCollection
      .where(
        command
          .or([{
            name: db.RegExp({
              regexp: event.keyword,
              options: 'i',
            })
          },
          {
            category: {
              name: db.RegExp({
                regexp: event.keyword,
                options: 'i'
              })
            }
          }
          ])
          .and({
            state: GoodsState.InSale
          })
      )
      .skip(event.lastIndex)
      .limit(evrnt.size)
      .get()
    ctx.body = result.data
  })

  app.router('searchGoodsByCategory', async (ctx) => {
    let result = await goodsCollection
      .where({
        category: {
          _id: event.categoryID
        },
        state: GoodsState.InSale
      })
      .skip(lastIndex)
      .limit(size)
      .get()
    ctx.body = result.data
  })

  app.router('publishGoods', async (ctx) => {
    let goods = event.goods;

    goods.sellerID = ctx.data.self._id;

    let categoryResult = await ctx.data.categoryCollection
      .doc(goods.categoryID)
      .get();

    let data = categoryResult.data;

    if (!data.length) {
      throw {
        code: HttpCode.Not_Found,
        message: '找不到商品分类信息'
      }
    }

    let category = data[0]

    goods.category = category;
    delete goods.categoryID;

    goods.publishTime = Date.now()

    goods.state = GoodsState.InSale

    await ctx.data.goodsCollection
      .add({
        data: goods
      })
  })

  app.router('getOngoingGoods', async (ctx) => {
    let goodsList = [];
    let data = [];
    let skip = 0;
    const limit = 20;

    do {
      let result = await ctx.data.goodsCollection
        .where({
          sellerID: ctx.data.self._id,
          state: GoodsState.InSale
        })
        .skip(skip)
        .limit(limit)
        .get();

      let data = result.data;

      goodsList = goods.concat(data);
    } while (data.length >= limit);

    ctx.body = goodsList;
  })

  app.router('deleteGoods', async (ctx) => {
    await ctx.data.goodsCollection
      .where({
        _id: event.goodsID,
        sellerID: ctx.data.self._id,
      })
      .update({
        data: {
          state: GoodsState.Deleted
        }
      })
  })


  app.router('deleteGoodsByAdmin', async (ctx) => {
    await ctx.data.goodsCollection
      .where({
        _id: event.goodsID,
      })
      .update({
        data: {
          state: GoodsState.Deleted
        }
      })
  })

  app.router('purchase', async (ctx) => {

  })

  return app.serve();
}

const GoodsState = {
  InSale: 0,
  Deleted: 1
}

const HttpCode = {
  Forbidden: 403, // 403
  Not_Found: 404, // 404
  Conflict: 409, // 409 冲突
  Fail: 500 // 500
}