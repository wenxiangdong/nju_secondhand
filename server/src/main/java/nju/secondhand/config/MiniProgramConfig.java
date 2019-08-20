package nju.secondhand.config;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * @author cst
 */
@Component
@ConfigurationProperties(prefix = "mini-program")
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class MiniProgramConfig {
    String appId;

    String appSecret;

    String env;

    String api;
}
