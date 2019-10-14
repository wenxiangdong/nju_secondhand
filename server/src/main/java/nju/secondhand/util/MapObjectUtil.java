package nju.secondhand.util;

import com.google.common.collect.ImmutableMap;
import lombok.experimental.UtilityClass;
import lombok.var;
import org.apache.http.NameValuePair;

import java.util.Map;

/**
 * @author cst
 */
@UtilityClass
public class MapObjectUtil {
    public Map mapObject(NameValuePair... pairs) {
        var object = ImmutableMap.builder();

        for (NameValuePair pair : pairs) {
            object = object.put(pair.getName(), pair.getValue());
        }

        return object.build();
    }

}

