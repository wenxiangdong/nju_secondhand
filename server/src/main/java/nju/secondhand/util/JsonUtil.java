package nju.secondhand.util;

import com.google.gson.Gson;
import lombok.experimental.UtilityClass;

/**
 * @author cst
 */
@UtilityClass
public class JsonUtil {
    public String toJson(Object object) {
        return new Gson().toJson(object);
    }

    public <T> T fromJson(String json, Class<T> tClass) {
        return new Gson().fromJson(json, tClass);
    }
}
