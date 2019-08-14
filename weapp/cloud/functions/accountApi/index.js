// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRounter = require('tcb-router')
const fs = require("fs");
const {LitePay, utils, Bank} = require("@sigodenjs/wechatpay");

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
    try {
      ctx.data.userCollection = db.collection('user')
    } catch (error) {
      console.error(error);
    }

    await next();
    console.log('----------> 退出 accountApi 全局中间件')
  })

  app.router(['withdraw', 'pay'], async (ctx, next) => {
    try {
      let self = await cloud.callFunction('userApi', {
        $url: 'getNormalSelf',
        openid: ctx.data.openid
      }).result;
      ctx.data.self = self;
    } catch (error) {
      console.error(error);
      ctx.data.self = {};
    }

    await next();
  })

  app.router('withdraw', async (ctx) => {
    const {self, userCollection} = ctx.data;
    let {amount} = event;

    // 前置检查余额
    const {account = {}} = self || {};
    let {balance = 0} = account;
    amount = parseFloat(amount);
    balance = parseFloat(balance);
    // if (balance < amount) {
    //   throw {
    //     code: HttpCode.Conflict,
    //     message: "账户余额不足"
    //   }
    // }

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
  const bank = new Bank({
    appId: APP_CONFIG.APP_ID,
    mchId: APP_CONFIG.ACCOUNT,
    key: APP_CONFIG.KEY,
    pfx: APP_CONFIG.CERT
  });
  // 转换成分
  amount = parseFloat(amount);
  amount = amount * 100;
  try {
    const res = await bank.transfers({
      openid: openID,
      check_name: "NO_CHECK",
      amount: amount,
      partner_trade_no: utils.nonceStr(),
      desc: "南大小书童提现",
      spbill_create_ip: "127.0.0.1"
    });
    console.log(res);
  } catch (error) {
    console.error(error);
    throw {
      code: HttpCode.Fail,
      message: "提现失败，如果出现资金异常请进行投诉或直接联系客服"
    };
  }
}


const pay = async ({openID, payTitle = "南大小书童闲置物品", payAmount = 0, orderID = ""}) => {
  const config = {
    appId: APP_CONFIG.APP_ID,
    mchId: APP_CONFIG.ACCOUNT,
    key: APP_CONFIG.KEY,

  };
  const pay = new LitePay(config);

 

  // 转换成分
  payAmount = parseFloat(payAmount);
  payAmount = payAmount * 100;

  try {
    const orderInfo = {
      body: `${payTitle}`,
      out_trade_no: orderID || utils.nonceStr(),
      total_fee: payAmount + '',
      spbill_create_ip: "192.168.0.1",
      notify_url: "https://github.wenxiangdong.io",
      openid: openID
    };
    console.log(orderInfo, config);
    pay.setDebug(true);
    const result = await pay.unifiedOrder(orderInfo);
    console.log(result);
    if (result.result_code === "SUCCESS") {
      const {prepay_id, nonce_str} = result;
      // 再次签名
      
    }
  } catch (error) {
    console.error(error);
    throw {
      code: HttpCode.Fail,
      message: "预下单失败"
    }
  }
  
}



const APP_CONFIG = {
  APP_ID: "wx5b54b56253641b80",
  APP_SECRET: "9a68b7d1de471d54457fd650e960e3fd",
  ACCOUNT: "1524825661",
  KEY: "NanjingdunshudianzishangwuYXXL18",
  CERT: fs.readFileSync('cert.p12')
};

// const APP_CONFIG = {
//   APP_ID: "wx8e5c5b550a9d9874",
//   APP_SECRET: "ca5fbd48dfa1a22282998e2ffcd4ecbf",
//   ACCOUNT: "1512752051",
//   KEY: "shenghuokexuejiaoshi123456789123",
//   CERT: fs.readFileSync('cert.p12')
// };

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