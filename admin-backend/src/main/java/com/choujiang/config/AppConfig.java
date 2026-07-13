package com.choujiang.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * 新版Spring boot 中 不自动引入RestTemplate Bean
 *
 * @author by <a href="mailto:ligang941012@gmail.com">gang.Li</a>
 * @since 7/13/2026 5:09 PM
 */
@Configuration
public class AppConfig {
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
