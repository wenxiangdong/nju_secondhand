package nju.secondhand.vo;

import lombok.Data;

import java.util.List;

/**
 * @author cst
 */
@Data
public class GoodsVO extends VO {
    String sellerID;
    String sellerName;

    String name;
    String desc;
    String price;
    Integer num;
    List<String> pictures;
    CategoryVO categoryVO;

    Long publishTime;

    Integer state;
}
