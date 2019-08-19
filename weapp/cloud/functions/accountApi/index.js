// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRounter = require('tcb-router')
const fs = require("fs");
const Tenpay = require("tenpay");
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
    let loginResult = (await cloud.callFunction({
      name: 'userApi',
      data: {
        $url: 'login',
        openid: ctx.data.openid
      }
    })).result;

    if (loginResult.code === HttpCode.Not_Found) {
      ctx.body = {
        code: HttpCode.Not_Found,
        message: '找不到您的个人消息'
      }
    } else {
      self = loginResult.data
      switch (self.state) {
        case UserState.Frozen:
          ctx.body = {
            code: HttpCode.Forbidden,
            message: '您的帐户被冻结'
          }
          break
        default:
          ctx.data.self = self;
          await next();
      }
    }
  })

  app.router('withdraw', async (ctx) => {
    const {self, userCollection} = ctx.data;
    let {amount} = event;

    // 前置检查余额
    const {account = {}} = self || {};
    let {balance = 0} = account;
    amount = parseFloat(amount);
    balance = parseFloat(balance);
    if (balance < amount) {
      ctx.body = {
        code: HttpCode.Conflict,
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
    await userCollection
      .doc(self._id)
      .update({
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

  /**
   * 参数
   * payTitle 支付的标题，例“商品xxx”
   * payAmount 支付的金额
   * orderID 要保证唯一性，此笔交易的id
   */
  app.router('pay', async(ctx) => {
    console.log("进入 pay route", ctx.data);
    const {payTitle, payAmount, orderID} = event;
    const result = await pay({openID: ctx.data.openid, payTitle, payAmount, orderID});
    ctx.body = {code: HttpCode.Success, data: result};
  })


  app.router('withraw-test', async(ctx) => {
    await withdraw({
      openID: cloud.getWXContext().OPENID,
      amount: 0.01
    });
  })

  return app.serve();
}


const withdraw = async ({openID = "", amount = 0}) => {
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


const pay = async ({openID, payTitle = "南大小书童闲置物品", payAmount = 0, orderID = ""}) => {
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

// const APP_CONFIG = {
//   APP_ID: "wx8e5c5b550a9d9874",
//   APP_SECRET: "ca5fbd48dfa1a22282998e2ffcd4ecbf",
//   ACCOUNT: "1512752051",
//   KEY: "shenghuokexuejiaoshi123456789123",
//   CERT: fs.readFileSync('cert.p12')
// };

const HttpCode = {
  Success: 200,
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