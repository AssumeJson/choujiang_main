package com.choujiang.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 微信配置类
 *
 * @author by <a href="mailto:ligang941012@gmail.com">gang.Li</a>
 * @since 7/14/2026 10:50 AM
 */
@Configuration
@ConfigurationProperties("wechat")
@Data
public class WechatProperties {
    private String appId;
    private String appSecret;
}
