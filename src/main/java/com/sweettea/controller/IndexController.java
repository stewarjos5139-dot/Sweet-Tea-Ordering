package com.sweettea.controller;

import com.sweettea.model.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 首页控制器 —— 对应模块1（组长任务）
 * 提供推荐商品接口
 */
@RestController
@RequestMapping("/api/index")
public class IndexController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 推荐商品 RowMapper（纯 JDBC 手动映射）
     */
    private static class ProductRowMapper implements RowMapper<Product> {
        @Override
        public Product mapRow(ResultSet rs, int rowNum) throws SQLException {
            Product p = new Product();
            p.setId(rs.getInt("id"));
            p.setCategoryId(rs.getInt("category_id"));
            p.setName(rs.getString("name"));
            p.setDescription(rs.getString("description"));
            p.setPrice(rs.getDouble("price"));
            p.setImageUrl(rs.getString("image_url"));
            p.setStock(rs.getInt("stock"));
            p.setIsRecommend(rs.getInt("is_recommend"));
            return p;
        }
    }

    /**
     * GET /api/index/recommend
     * 返回首页推荐商品列表（is_recommend = 1 的商品）
     */
    @GetMapping("/recommend")
    public Map<String, Object> getRecommendProducts() {
        Map<String, Object> result = new HashMap<>();
        try {
            String sql = "SELECT * FROM products WHERE is_recommend = 1 ORDER BY id DESC";
            List<Product> list = jdbcTemplate.query(sql, new ProductRowMapper());
            result.put("code", 200);
            result.put("message", "success");
            result.put("data", list);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "服务器错误：" + e.getMessage());
            result.put("data", null);
        }
        return result;
    }
}
