package nju.secondhand.util;

import com.google.common.collect.ImmutableMap;
import lombok.experimental.UtilityClass;
import lombok.var;

/**
 * @author cst
 */
@UtilityClass
public class MapObjectUtil {
    public Object mapObject(Pair... pairs) {
        var object = ImmutableMap.builder();

        for (Pair pair : pairs) {
            object = object.put(pair.key, pair.value);
        }

        return object.build();
    }
}

