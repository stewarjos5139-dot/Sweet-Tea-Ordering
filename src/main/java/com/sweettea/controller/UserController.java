package com.sweettea.controller;

import com.sweettea.model.User;
import jakarta.servlet.http.HttpSession;
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
 * 用户控制器 —— 对应模块5（登录/登出）
 */
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private static class UserRowMapper implements RowMapper<User> {
        @Override
        public User mapRow(ResultSet rs, int rowNum) throws SQLException {
            User u = new User();
            u.setId(rs.getInt("id"));
            u.setUsername(rs.getString("username"));
            u.setPassword(rs.getString("password"));
            u.setAddress(rs.getString("address"));
            return u;
        }
    }

    /**
     * POST /api/user/login
     * 用户登录 —— 使用 Session 记录登录状态
     *
     * 请求体 JSON：{ "username": "testuser", "password": "123456" }
     */
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> body, HttpSession session) {
        Map<String, Object> result = new HashMap<>();

        String username = body.get("username");
        String password = body.get("password");

        if (username == null || username.trim().isEmpty()
                || password == null || password.trim().isEmpty()) {
            result.put("code", 400);
            result.put("message", "用户名和密码不能为空");
            return result;
        }

        try {
            String sql = "SELECT * FROM users WHERE username = ? AND password = ?";
            List<User> users = jdbcTemplate.query(sql, new UserRowMapper(), username.trim(), password.trim());

            if (users.isEmpty()) {
                result.put("code", 401);
                result.put("message", "用户名或密码错误");
                result.put("data", null);
            } else {
                User user = users.get(0);
                // 将用户信息存入 Session（不存密码）
                user.setPassword(null);
                session.setAttribute("loginUser", user);

                result.put("code", 200);
                result.put("message", "登录成功");
                result.put("data", user);
            }
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "服务器错误：" + e.getMessage());
            result.put("data", null);
        }

        return result;
    }

    /**
     * POST /api/user/logout
     * 用户登出 —— 清除 Session
     */
    @PostMapping("/logout")
    public Map<String, Object> logout(HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        session.invalidate();
        result.put("code", 200);
        result.put("message", "已退出登录");
        return result;
    }

    /**
     * GET /api/user/current
     * 获取当前登录用户信息（用于页面初始化时检查登录状态） —— 模块5
     */
    @GetMapping("/current")
    public Map<String, Object> getCurrentUser(HttpSession session) {
        Map<String, Object> result = new HashMap<>();
        User loginUser = (User) session.getAttribute("loginUser");

        if (loginUser == null) {
            result.put("code", 401);
            result.put("message", "未登录");
            result.put("data", null);
        } else {
            result.put("code", 200);
            result.put("message", "已登录");
            result.put("data", loginUser);
        }
        return result;
    }
}
