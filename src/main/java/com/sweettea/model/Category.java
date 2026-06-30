package com.sweettea.model;

/**
 * 分类模型 —— 对应数据库 categories 表
 */
public class Category {
    private Integer id;
    private String name;

    public Category() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
