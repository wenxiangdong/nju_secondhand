package nju.secondhand.util;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;

/**
 * @author cst
 */
@AllArgsConstructor(staticName = "of", access = AccessLevel.PUBLIC)
public class Pair {
    Object key;
    Object value;
}
