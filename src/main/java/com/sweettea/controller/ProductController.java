package com.sweettea.controller;

import com.sweettea.model.Product;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.bind.annotation.*;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

/**
 * 商品控制器 —— 对应模块3（详情）和模块4（全部商品）
 */
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

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
     * GET /api/products/{id}
     * 查询单个商品详情 —— 模块3
     */
    @GetMapping("/{id}")
    public Map<String, Object> getProductById(@PathVariable("id") Integer id) {
        Map<String, Object> result = new HashMap<>();
        try {
            String sql = "SELECT * FROM products WHERE id = ?";
            List<Product> list = jdbcTemplate.query(sql, new ProductRowMapper(), id);
            if (list.isEmpty()) {
                result.put("code", 404);
                result.put("message", "商品不存在");
                result.put("data", null);
            } else {
                result.put("code", 200);
                result.put("message", "success");
                result.put("data", list.get(0));
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "服务器错误：" + e.getMessage());
            result.put("data", null);
        }
        return result;
    }

    /**
     * GET /api/products/all
     * 分页查询全部商品（支持关键字模糊搜索） —— 模块4
     *
     * @param page    页码，默认 1
     * @param size    每页条数，默认 10
     * @param keyword 搜索关键字（匹配商品名），可选
     */
    @GetMapping("/all")
    public Map<String, Object> getAllProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {

        Map<String, Object> result = new HashMap<>();
        try {
            // 构建 SQL（动态拼接条件）
            StringBuilder countSql = new StringBuilder("SELECT COUNT(*) FROM products WHERE 1=1");
            StringBuilder dataSql = new StringBuilder("SELECT * FROM products WHERE 1=1");

            List<Object> params = new ArrayList<>();

            if (keyword != null && !keyword.trim().isEmpty()) {
                String like = "%" + keyword.trim() + "%";
                countSql.append(" AND name LIKE ?");
                dataSql.append(" AND name LIKE ?");
                params.add(like);
            }

            dataSql.append(" ORDER BY id DESC LIMIT ? OFFSET ?");

            // 查询总数
            int total = jdbcTemplate.queryForObject(
                    countSql.toString(),
                    Integer.class,
                    params.toArray()
            );

            // 分页参数
            int offset = (page - 1) * size;
            List<Object> dataParams = new ArrayList<>(params);
            dataParams.add(size);
            dataParams.add(offset);

            List<Product> list = jdbcTemplate.query(
                    dataSql.toString(),
                    new ProductRowMapper(),
                    dataParams.toArray()
            );

            Map<String, Object> pageData = new HashMap<>();
            pageData.put("list", list);
            pageData.put("total", total);
            pageData.put("page", page);
            pageData.put("size", size);
            pageData.put("totalPages", (int) Math.ceil((double) total / size));
            pageData.put("hasMore", page * size < total);

            result.put("code", 200);
            result.put("message", "success");
            result.put("data", pageData);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "服务器错误：" + e.getMessage());
            result.put("data", null);
        }
        return result;
    }
}
