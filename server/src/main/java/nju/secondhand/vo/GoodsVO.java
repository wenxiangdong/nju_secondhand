package nju.secondhand.vo;

import lombok.Data;

import java.util.List;

/**
 * @author cst
 */
@Data
public class GoodsVO extends VO {
    String sellerID;

    String name;
    String desc;
    String price;
    List<String> pictures;
    CategoryVO categoryVO;

    Integer publishTime;

    Integer state;
}
