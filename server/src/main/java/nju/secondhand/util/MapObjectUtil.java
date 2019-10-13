package nju.secondhand.util;

import com.google.common.collect.ImmutableMap;
import lombok.*;
import lombok.experimental.UtilityClass;
import nju.secondhand.util.entity.Pair;

/**
 * @author cst
 */
@UtilityClass
public class MapObjectUtil {
    public Object mapObject(Pair... pairs) {
        var object = ImmutableMap.builder();

        for (Pair pair : pairs) {
            object = object.put(pair.getKey(), pair.getValue());
        }

        return object.build();
    }

}

