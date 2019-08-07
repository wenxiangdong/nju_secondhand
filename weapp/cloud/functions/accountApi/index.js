// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRounter = require('tcb-router')
const {Wechat, Payment} = require('wechat-jssdk');
const fs = require("fs");
const TenPay = require("tenpay");

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event);
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

  app.router(['withdraw', 'pay'], async (ctx, next) => {
    let self = await cloud.callFunction('userApi', {
      $url: 'getNormalSelf',
      openid: ctx.data.openid
    }).result;
    ctx.data.self = self;

    await next();
  })

  app.router('withdraw', async (ctx) => {
    const {self, userCollection} = ctx.data;
    let {amount} = event;

    // 前置检查余额
    const {account = {}} = self;
    let {balance = 0} = account;
    amount = parseFloat(amount);
    balance = parseFloat(balance);
    if (balance < amount) {
      throw {
        code: HttpCode.Conflict,
        message: "账户余额不足"
      }
    }

    // 微信企业付款
    await withdraw({
      openID: ctx.data.openid,
      amount: amount
    });

    // 更新数据库
    await userCollection
      .doc(self._id)
      .update({
        data: {
          account: {
            balance: (balance - amount) + ''
          }
        }
      })
  })

  /**
   * 参数
   * payTitle 支付的标题，例“商品xxx”
   * payAmount 支付的金额
   * orderID 要保证唯一性，此笔交易的id
   */
  app.router('pay', async(ctx) => {
    console.log("进入 pay route", ctx.data);
    const {payTitle, payAmount, orderID} = event;
    await pay({openID: ctx.data.openid, payTitle, payAmount, orderID});
  })

  return app.serve();
}


const withdraw = async ({openID = "", amount = 0}) => {
  
  const config = {
    appid: APP_CONFIG.APP_ID,
    mchid: APP_CONFIG.ACCOUNT,
    partnerKey: APP_CONFIG.KEY,
    // TODO: 读取证书
    // pfx: require('fs').readFileSync(''),
    spbill_create_ip: '127.0.0.1'
  };

  const tenPay = new TenPay(config, true);
  try {
    // 确保金额是数字
    amount = parseFloat(amount);
    // 支付参数
    const param = {
      partner_trade_no: utils.createNonceStr(),
      openid: openID,
      check_name: "NO_CHECK",
      amount: amount * 100, // 用 分作单位
      desc: "南大小书童提现"
    };
    console.log(param);
    const result = await tenPay.transfers(param);
    console.log(result);
  } catch (error) {
    console.error(error);
    throw {
      code: HttpCode.Fail,
      message: "提现失败，如果出现账户资金异常请投诉或联系客服进行操作。"
    };
  }

}


const pay = async ({openID, payTitle = "南大小书童闲置物品", payAmount = 0, orderID = ""}) => {
  const wx = new Wechat(WECHAT_CONFIG);

  const nonceStr = utils.createNonceStr();
  const body = payTitle;
  orderID = orderID || wx.payment.simpleTradeNo();

  // 转换成分
  payAmount = parseFloat(payAmount);
  payAmount = payAmount * 100;

  const defaultInfo = {
    device_info: 'wechat_web',
    body: payTitle,
    total_fee: payAmount,
    spbill_create_ip: '127.0.0.1',
    out_trade_no: orderID,
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
    const {prepay_id} = res;
    const toSign = {
      appId: APP_CONFIG.APP_ID,
      signType: Payment.SIGN_TYPE.MD5,
      package: `prepay_id=${$prepay_id}`,
      nonceStr: nonceStr,
      timeStamp: +new Date()
    };
    // 再次签名
    const paySign = wx.payment.generateSignature(toSign);
    // 返回给小程序，直接可以利用这些数据发起支付
    ctx.body = {
      ...toSign,
      paySign
    };
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
  KEY: "ljxst2018！ljxst2018！ljxst2018！"
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


// interface UserVO extends VO {
//   // _openid: string;  为安全性考虑，不将该属性返回

//   phone: string;
//   avatar: string;
//   nickname: string;
//   address: Location;
//   email: string;

//   account: AccountVO;

//   signUpTime: number;
//   state: UserState;
// }

// interface AccountVO {
//   balance: string;
// }