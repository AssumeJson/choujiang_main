package com.choujiang;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.choujiang.mapper")
public class LotteryAdminApplication {
    public static void main(String[] args) {
        SpringApplication.run(LotteryAdminApplication.class, args);
    }
}
