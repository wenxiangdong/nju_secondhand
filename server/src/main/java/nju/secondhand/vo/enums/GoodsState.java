package nju.secondhand.vo.enums;

import lombok.Getter;

/**
 * @author cst
 */

public enum GoodsState {
    InSale(0),
    Deleted(1);
    @Getter
    private final int value;

    GoodsState(int value) {
        this.value = value;
    }
}
