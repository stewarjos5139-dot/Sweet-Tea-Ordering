package com.sweettea.controller;

import com.sweettea.model.Order;
import com.sweettea.model.User;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.TransactionCallback;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.bind.annotation.*;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

/**
 * 订单控制器 —— 对应模块3（创建订单）和模块5（我的订单）
 */
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private TransactionTemplate transactionTemplate;

    // ========== RowMapper ==========

    private static class OrderRowMapper implements RowMapper<Order> {
        @Override
        public Order mapRow(ResultSet rs, int rowNum) throws SQLException {
            Order o = new Order();
            o.setId(rs.getInt("id"));
            o.setUserId(rs.getInt("user_id"));
            o.setTotalPrice(rs.getDouble("total_price"));
            o.setStatus(rs.getString("status"));
            o.setCreateTime(rs.getTimestamp("create_time"));
            return o;
        }
    }

    /**
     * POST /api/orders/create
     * 创建订单（包含事务：库存校验 → 创建订单 → 扣减库存）
     *
     * 请求体 JSON 示例：
     * {
     *   "items": [
     *     { "productId": 1, "quantity": 2, "sweetness": "半糖", "iceLevel": "少冰" }
     *   ]
     * }
     *
     * 模块3：商品详情与下单
     */
    @PostMapping("/create")
    public Map<String, Object> createOrder(
            @RequestBody Map<String, Object> body,
            HttpSession session) {

        Map<String, Object> result = new HashMap<>();

        // 1. 校验登录状态
        User loginUser = (User) session.getAttribute("loginUser");
        if (loginUser == null) {
            result.put("code", 401);
            result.put("message", "请先登录后再下单");
            return result;
        }

        // 2. 解析请求参数
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> itemsRaw = (List<Map<String, Object>>) body.get("items");
        if (itemsRaw == null || itemsRaw.isEmpty()) {
            result.put("code", 400);
            result.put("message", "订单商品不能为空");
            return result;
        }

        // 3. 在事务中执行：查价 → 验库存 → 建订单 → 扣库存
        try {
            Integer orderId = transactionTemplate.execute(new TransactionCallback<Integer>() {
                @Override
                public Integer doInTransaction(TransactionStatus status) {
                    double totalPrice = 0.0;
                    List<Object[]> orderItemParams = new ArrayList<>();

                    for (Map<String, Object> item : itemsRaw) {
                        int productId = (int) item.get("productId");
                        int quantity = (int) item.get("quantity");
                        String sweetness = (String) item.getOrDefault("sweetness", "全糖");
                        String iceLevel = (String) item.getOrDefault("iceLevel", "正常");

                        // 查询商品价格与库存
                        Map<String, Object> product = jdbcTemplate.queryForMap(
                                "SELECT price, stock FROM products WHERE id = ?", productId);
                        double price = ((Number) product.get("price")).doubleValue();
                        int stock = ((Number) product.get("stock")).intValue();

                        // 库存不足 → 回滚
                        if (stock < quantity) {
                            throw new RuntimeException("商品「" + productId + "」库存不足，当前库存：" + stock);
                        }

                        totalPrice += price * quantity;
                        orderItemParams.add(new Object[]{
                                null, // order_id 稍后填入
                                productId, quantity, sweetness, iceLevel
                        });
                    }

                    // 插入订单主表
                    jdbcTemplate.update(
                            "INSERT INTO orders (user_id, total_price, status, create_time) VALUES (?, ?, 'pending', NOW())",
                            loginUser.getId(), totalPrice);

                    // 获取刚生成的订单 ID（MySQL 自增键不能直接跨连接获取，用 LAST_INSERT_ID()）
                    Integer newOrderId = jdbcTemplate.queryForObject(
                            "SELECT LAST_INSERT_ID()", Integer.class);

                    // 插入订单详情 & 扣减库存
                    for (int i = 0; i < orderItemParams.size(); i++) {
                        Map<String, Object> item = itemsRaw.get(i);
                        int productId = (int) item.get("productId");
                        int quantity = (int) item.get("quantity");
                        String sweetness = (String) item.getOrDefault("sweetness", "全糖");
                        String iceLevel = (String) item.getOrDefault("iceLevel", "正常");

                        jdbcTemplate.update(
                                "INSERT INTO order_items (order_id, product_id, quantity, sweetness, ice_level) VALUES (?, ?, ?, ?, ?)",
                                newOrderId, productId, quantity, sweetness, iceLevel);

                        jdbcTemplate.update(
                                "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
                                quantity, productId, quantity);
                    }

                    return newOrderId;
                }
            });

            result.put("code", 200);
            result.put("message", "下单成功");
            Map<String, Object> data = new HashMap<>();
            data.put("orderId", orderId);
            result.put("data", data);

        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "下单失败：" + e.getMessage());
            result.put("data", null);
        }

        return result;
    }

    /**
     * GET /api/orders/my
     * 获取当前登录用户的历史订单（含订单详情） —— 模块5
     */
    @GetMapping("/my")
    public Map<String, Object> getMyOrders(HttpSession session) {
        Map<String, Object> result = new HashMap<>();

        User loginUser = (User) session.getAttribute("loginUser");
        if (loginUser == null) {
            result.put("code", 401);
            result.put("message", "请先登录");
            result.put("data", null);
            return result;
        }

        try {
            // 查询用户的所有订单
            String orderSql = "SELECT * FROM orders WHERE user_id = ? ORDER BY create_time DESC";
            List<Order> orders = jdbcTemplate.query(orderSql, new OrderRowMapper(), loginUser.getId());

            // 构建返回数据：每个订单包含订单详情
            List<Map<String, Object>> orderList = new ArrayList<>();

            for (Order order : orders) {
                String itemSql = "SELECT oi.*, p.name AS product_name, p.price AS product_price, "
                        + "p.image_url AS product_image_url "
                        + "FROM order_items oi "
                        + "JOIN products p ON oi.product_id = p.id "
                        + "WHERE oi.order_id = ?";
                List<Map<String, Object>> items = jdbcTemplate.queryForList(itemSql, order.getId());

                List<Map<String, Object>> itemList = new ArrayList<>();
                for (Map<String, Object> row : items) {
                    Map<String, Object> itemMap = new LinkedHashMap<>();
                    itemMap.put("id", ((Number) row.get("id")).intValue());
                    itemMap.put("orderId", ((Number) row.get("order_id")).intValue());
                    itemMap.put("productId", ((Number) row.get("product_id")).intValue());
                    itemMap.put("quantity", ((Number) row.get("quantity")).intValue());
                    itemMap.put("sweetness", row.get("sweetness"));
                    itemMap.put("iceLevel", row.get("ice_level"));
                    itemMap.put("productName", row.get("product_name"));
                    itemMap.put("productPrice", ((Number) row.get("product_price")).doubleValue());
                    itemMap.put("productImageUrl", row.get("product_image_url"));
                    itemList.add(itemMap);
                }

                Map<String, Object> orderMap = new LinkedHashMap<>();
                orderMap.put("id", order.getId());
                orderMap.put("userId", order.getUserId());
                orderMap.put("totalPrice", order.getTotalPrice());
                orderMap.put("status", order.getStatus());
                orderMap.put("createTime", order.getCreateTime());
                orderMap.put("items", itemList);
                orderList.add(orderMap);
            }

            result.put("code", 200);
            result.put("message", "success");
            result.put("data", orderList);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "服务器错误：" + e.getMessage());
            result.put("data", null);
        }

        return result;
    }
}
