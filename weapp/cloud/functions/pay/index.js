const wx = require("wx-server-sdk");
const tenpay = require("tenpay");

wx.init();

const APP_CONFIG = {
    APP_ID: "wxc4e156082fbd97ba",
    ACCOUNT: "1521513131",
    KEY: "NanjingdunshudianzishangwuYXXL18",
    // PARENT_ID: "wxa9b5bc5cfae5e95e",
    // PARENT_MCH_ID: "1524825661"
}

exports.main = async (event) => {
    const pay = new tenpay({
        appid: APP_CONFIG.APP_ID,
        mchid: APP_CONFIG.ACCOUNT,
        partnerKey: APP_CONFIG.KEY,
        notify_url: "https://xcx.360yingketong.com",
        spbill_create_ip: "127.0.0.1"
    }, true);
    try {
        const res = pay.getPayParams({
            out_trade_no: `hehe${+new Date()}`,
            body: '商品简单描述',
            total_fee: 1, //订单金额(分),
            openid: wx.getWXContext().OPENID,
        });
        console.log(res);
    } catch (error) {
        console.error(error)
    }
}

