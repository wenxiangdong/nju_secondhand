package nju.secondhand.util.entity;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * @author cst
 */
@AllArgsConstructor(staticName = "of", access = AccessLevel.PUBLIC)
@FieldDefaults(level = AccessLevel.PROTECTED)
@Getter
public class Pair {
    String key;
    Object value;

    public String toKeyValueString() {
        return key + "=" + value;
    }
}
