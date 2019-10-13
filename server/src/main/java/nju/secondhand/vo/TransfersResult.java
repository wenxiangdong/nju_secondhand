package nju.secondhand.vo;

import lombok.Setter;
import lombok.ToString;

/**
 * 企业付款结果的数据结构
 *
 * @author cst
 */
@Setter
@ToString
public class TransfersResult {
    String return_code;
    String return_msg;


    // 以下字段在return_code为SUCCESS的时候确保值有效

    String mch_appid;
    String mchid;
    String nonce_str;

    String result_code;
    String err_code;
    String err_code_des;

    // 以下字段在return_code 和result_code都为SUCCESS的时候有效

    String partner_trade_no;
    String payment_no;
    String payment_time;
}
