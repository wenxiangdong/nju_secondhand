package nju.secondhand.config;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @author cst
 */
@Data
@Component
@ConfigurationProperties(prefix = "mini-program")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MiniProgramProperties {
    String appId;

    String appSecret;

    String env;

    /**
     * 增加企业付款属性
     */
    String mchid;

    String check_name;

    String desc;

    String app_key;

    String cert_path;

    String transfers_desc;

    String ip;
}
