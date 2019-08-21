package nju.secondhand.vo.enums;


import lombok.Getter;

/**
 * @author cst
 */
public enum ComplaintState {
    /**
     * 进行中
     */
    Ongoing(0),
    /**
     * 已处理
     */
    Handled(1);

    @Getter
    private final int value;

    ComplaintState(int value) {
        this.value = value;
    }
}
