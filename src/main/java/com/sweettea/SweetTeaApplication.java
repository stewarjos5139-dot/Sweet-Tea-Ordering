package com.sweettea;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SweetTeaApplication {
    public static void main(String[] args) {
        SpringApplication.run(SweetTeaApplication.class, args);
        System.out.println("========================================");
        System.out.println("  甜趣奶茶点单系统 启动成功！");
        System.out.println("  访问地址: http://localhost:8080");
        System.out.println("========================================");
    }
}
