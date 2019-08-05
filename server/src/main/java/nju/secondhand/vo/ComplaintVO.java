package nju.secondhand.vo;

import lombok.Data;
import nju.secondhand.vo.state.ComplaintState;

import java.util.List;

/**
 * @author cst
 */
@Data
public class ComplaintVO {
    String orderID;
    String desc;

    String complainantID;
    String complainantName;

    List<String> pictures;

    Integer complainTime;

    Handling handling;

    ComplaintState state;

    @Data
    private static class Handling {
        Integer time;
        String result;
    }
}
