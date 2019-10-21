package nju.secondhand.vo.enums;

import lombok.Getter;

/**
 * @author cst
 */

public enum OrderState {
    Ongoing(0),
    Finished(1),
    Paying(-1);

    @Getter
    private final int value;

    OrderState(int value) {
        this.value = value;
    }
}
