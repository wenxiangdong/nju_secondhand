package nju.secondhand.util;

import com.google.common.collect.ImmutableMap;
import lombok.experimental.UtilityClass;
import lombok.var;

import java.util.Map;

/**
 * @author cst
 */
@UtilityClass
public class MapObjectUtil {
    public Map mapObject(Map.Entry... pairs) {
        var object = ImmutableMap.builder();

        for (Map.Entry pair : pairs) {
            object = object.put(pair.getKey(), pair.getValue());
        }

        return object.build();
    }

}

