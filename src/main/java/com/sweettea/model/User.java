package com.sweettea.model;

/**
 * 用户模型 —— 对应数据库 users 表
 */
public class User {
    private Integer id;
    private String username;
    private String password;
    private String address;

    public User() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
