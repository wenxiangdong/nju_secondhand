// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRounter = require('tcb-router')
const {Wechat, Payment} = require('wechat-jssdk');
const fs = require("fs");

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRounter({
    event
  })

  app.use(async (ctx, next) => {
    console.log('----------> 进入 accountApi 全局中间件')
    ctx.data = {}
    ctx.data.openid = cloud.getWXContext().OPENID
    ctx.data.userCollection = db.collection('user')

    await next();
    console.log('----------> 退出 accountApi 全局中间件')
  })

  app.router(['withdraw'], async (ctx, next) => {
    let self = await cloud.callFunction('userApi', {
      $url: 'getNormalSelf',
      openid: ctx.data.openid
    }).result;
    ctx.data.self = self;

    await next();
  })

  app.router('withdraw', async (ctx) => {

  })

  app.router('pay', async(ctx) => {
    console.log("进入 pay route", ctx.data);
    await pay(ctx.data.openid);
  })

  return app.serve();
}

const pay = async (openID) => {
  const wx = new Wechat(WECHAT_CONFIG);

  const nonceStr = utils.createNonceStr();
  const body = `ORDER_测试`;

  const defaultInfo = {
    device_info: 'wechat_test_web',
    body: body,
    attach: '上海分店',
    total_fee: '101',
    spbill_create_ip: '127.0.0.1',
    goods_tag: 'wx_test',
    trade_type: Payment.TRADE_TYPE.JSAPI,
    openid: openID,
    appid: APP_CONFIG.APP_ID,
    mch_id: APP_CONFIG.ACCOUNT,
    nonce_str: nonceStr,
    sign_type: Payment.SIGN_TYPE.MD5
  };
  console.log(defaultInfo, APP_CONFIG);
  
  try {
    const res = await wx.payment.unifiedOrder(defaultInfo);
    console.log(res);
  } catch (e) {
    console.error(e);
    throw {
      code: HttpCode.Fail,
      message: `支付失败`
    };
  }
}



const APP_CONFIG = {
  // APP_ID: "wx8e5c5b550a9d9874", // kefubao
  APP_ID: "wxc4e156082fbd97ba",
  // APP_SECRET: "ca5fbd48dfa1a22282998e2ffcd4ecbf", // kefubao
  APP_SECRET: "08c5dba9b8e3f52eded6f4c9a0ad4650",
  // ACCOUNT: "1512752051", // kefubao
  ACCOUNT: "1521513131",
  // KEY: "shenghuokexuejiaoshi123456789123",  // kefubao
  KEY: "ljxst2018!"
};

const WECHAT_CONFIG = {
  //第一个为设置网页授权回调地址
  wechatRedirectUrl: "https://wenxiangdong.github.io", 
  wechatToken: "token", //第一次在微信控制台保存开发者配置信息时使用
  appId: APP_CONFIG.APP_ID,
  appSecret: APP_CONFIG.APP_SECRET,
  payment: true, //开启支付支持，默认关闭
  merchantId: APP_CONFIG.ACCOUNT, //商户ID
  paymentSandBox: false, //沙箱模式，验收用例
  paymentKey: APP_CONFIG.KEY, //必传，验签密钥，TIP:获取沙箱密钥也需要真实的密钥，所以即使在沙箱模式下，真实验签密钥也需要传入。
  //pfx 证书 这个可以先随便填
  paymentCertificatePfx: "hhh",
  //默认微信支付通知地址
  paymentNotifyUrl: `http://your.domain.com/api/wechat/payment/`,
  //小程序配置
  "miniProgram": {
    "appId": APP_CONFIG.APP_ID,
    "appSecret": APP_CONFIG.APP_SECRET,
  }
}

const utils = {
  createNonceStr: function() {
    return Math.random()
    .toString(36)
    .substr(2, 15);
  }
};

const HttpCode = {
  Forbidden: 403, // 403
  Not_Found: 404, // 404
  Conflict: 409, // 409 冲突
  Fail: 500 // 500
}