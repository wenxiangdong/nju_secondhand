package nju.secondhand.service;

import nju.secondhand.vo.TransfersResult;

/**
 * @author cst
 */
public interface PayService {
    /**
     * 企业付款到微信零钱
     *
     * @param openid           用户openid
     * @param amount           提现金额（以元为基本单位）
     * @param partner_trade_no 商户订单号
     */
    TransfersResult transfers(String openid, int amount, String partner_trade_no);
}
