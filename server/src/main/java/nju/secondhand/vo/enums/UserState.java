package nju.secondhand.vo.enums;

import lombok.Getter;

/**
 * @author cst
 */
public enum UserState {
    UnRegistered(0),
    Normal(1),
    Frozen(2);

    @Getter
    private final int value;

    UserState(int value) {
        this.value = value;
    }
}
