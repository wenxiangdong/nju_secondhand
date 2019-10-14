package nju.secondhand.service;

/**
 * @author cst
 */
public interface TransferService {
    /**
     * 企业付款到微信零钱
     *
     * @param openid 用户openid
     * @param amount 提现金额（以元为基本单位）
     */
    void transfers(String openid, int amount);
}
