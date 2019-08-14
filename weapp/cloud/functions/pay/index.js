const wx = require("wx-server-sdk");
const tenpay = require("tenpay");

wx.init();

const APP_CONFIG = {
    APP_ID: "wx5b54b56253641b80",
    ACCOUNT: "1524825661",
    KEY: "NanjingdunshudianzishangwuYXXL18",
}

exports.main = async (event) => {
    const pay = new tenpay({
        appid: APP_CONFIG.APP_ID,
        mchid: APP_CONFIG.ACCOUNT,
        partnerKey: APP_CONFIG.KEY,
        notify_url: "https://github.wenxiangdong.io/",
        spbill_create_ip: "127.0.0.1"
    }, true);
    try {
        const res = pay.getPayParams({
            out_trade_no: `hehe${+new Date()}`,
            body: '商品简单描述',
            total_fee: 1, //订单金额(分),
            openid: wx.getWXContext().OPENID //付款用户的openid
        });
        console.log(res);
    } catch (error) {
        console.error(error)
    }
}

