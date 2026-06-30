package com.sweettea.controller;

import com.sweettea.model.Category;
import com.sweettea.model.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.bind.annotation.*;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 分类控制器 —— 对应模块2（成员2任务）
 * 提供分类列表和按分类查询商品接口
 */
@RestController
@RequestMapping("/api")
public class CategoryController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // ========== RowMapper 映射 ==========

    private static class CategoryRowMapper implements RowMapper<Category> {
        @Override
        public Category mapRow(ResultSet rs, int rowNum) throws SQLException {
            Category c = new Category();
            c.setId(rs.getInt("id"));
            c.setName(rs.getString("name"));
            return c;
        }
    }

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

    // ========== 接口 ==========

    /**
     * GET /api/categories
     * 获取所有商品分类
     */
    @GetMapping("/categories")
    public Map<String, Object> getAllCategories() {
        Map<String, Object> result = new HashMap<>();
        try {
            String sql = "SELECT * FROM categories ORDER BY id";
            List<Category> list = jdbcTemplate.query(sql, new CategoryRowMapper());
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

    /**
     * GET /api/categories/{id}/products
     * 按分类 ID 查询该分类下的所有商品
     * 特殊处理：当 id = 0 时，返回全部商品（用于"全部"标签页）
     *
     * @param id 分类 ID（路径变量），0 表示全部
     */
    @GetMapping("/categories/{id}/products")
    public Map<String, Object> getProductsByCategory(@PathVariable("id") Integer id) {
        Map<String, Object> result = new HashMap<>();
        try {
            List<Product> list;
            if (id != null && id == 0) {
                // id=0：返回全部商品
                String sql = "SELECT * FROM products ORDER BY id DESC";
                list = jdbcTemplate.query(sql, new ProductRowMapper());
            } else {
                String sql = "SELECT * FROM products WHERE category_id = ? ORDER BY id DESC";
                list = jdbcTemplate.query(sql, new ProductRowMapper(), id);
            }
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
