package nju.secondhand.vo;

import lombok.Data;

import java.util.List;

/**
 * @author cst
 */
@Data
public class ComplaintVO extends VO {
    String orderID;
    String desc;

    String complainantID;
    String complainantName;

    List<String> pictures;

    Long complainTime;

    Integer state;
}
