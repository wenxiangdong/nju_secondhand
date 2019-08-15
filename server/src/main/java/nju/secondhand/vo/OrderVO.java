package nju.secondhand.vo;

import lombok.Data;

/**
 * @author cst
 */
@Data
public class OrderVO extends VO {
    String buyerID;
    String buyerName;

    String sellerID;
    String sellerName;

    String goodsID;
    String goodsName;
    String goodsPrice;

    Location address;

    Long orderTime;
    Long deliveryTime;

    Integer state;
}
