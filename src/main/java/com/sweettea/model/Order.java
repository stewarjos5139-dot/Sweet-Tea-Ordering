package com.sweettea.model;

import java.util.Date;

/**
 * 订单模型 —— 对应数据库 orders 表
 */
public class Order {
    private Integer id;
    private Integer userId;
    private Double totalPrice;
    private String status;
    private Date createTime;

    public Order() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Date getCreateTime() { return createTime; }
    public void setCreateTime(Date createTime) { this.createTime = createTime; }
}
