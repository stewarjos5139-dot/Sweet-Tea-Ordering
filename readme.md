# 🧋 甜趣奶茶点单系统 — 软件工程期末项目总结

> **项目名称**：甜趣奶茶点单系统（Sweet Tea Ordering）  
> **技术栈**：Java 17 + Spring Boot 3.2 + JDBC + MySQL 8.x + HTML5 + CSS3 + JavaScript + Bootstrap 3  
> **开发周期**：2026年6月  
> **开发模式**：模块化分工协作，前后端一一对应  

---

## 一、项目概述

甜趣奶茶点单系统是一个面向奶茶店的在线点单 Web 应用。用户可以在线浏览饮品分类、查看商品详情、选择规格（甜度/冰量）、下单购买。系统支持用户登录、订单管理、搜索分页等完整电商流程。

系统采用 **前后端分离架构**：
- **后端**：Spring Boot 3.2 + 纯 JDBC（JdbcTemplate）操作 MySQL，无 ORM 框架
- **前端**：纯原生 HTML/CSS/JS + Bootstrap 3 + Font Awesome 4 + jQuery + Ajax
- **数据库**：MySQL 8.x，共 5 张核心表，17 条初始数据

---

## 二、数据库设计（5 张表）

| 表名 | 说明 | 核心字段 |
|------|------|----------|
| `users` | 用户表 | id, username, password, address |
| `categories` | 商品分类表 | id, name |
| `products` | 商品表 | id, category_id, name, description, price, image_url, stock, is_recommend |
| `orders` | 订单表 | id, user_id, total_price, status, create_time |
| `order_items` | 订单明细表 | id, order_id, product_id, quantity, sweetness, ice_level |

**关系**：`products.category_id → categories.id`，`orders.user_id → users.id`，`order_items.order_id → orders.id`，`order_items.product_id → products.id`。

---

## 三、小组分工与模块详情

---

### 👤 成员 1 · 组长 — 首页统筹 & 项目架构

#### 负责内容

| 类别 | 文件 | 说明 |
|------|------|------|
| 项目搭建 | `pom.xml` | Maven 项目配置，父 POM `spring-boot-starter-parent:3.2.0`，依赖 Web、JDBC、MySQL 驱动 |
| 启动入口 | `SweetTeaApplication.java` | `@SpringBootApplication` 主启动类，控制台打印启动横幅 |
| 全局配置 | `application.properties` | 数据库连接（HikariCP 连接池）、服务端口 8080、JSON 日期格式、日志级别 |
| 数据库 | `schema.sql` | 完整建库 + 建表 + 外键 + 17 条示例数据 |
| 跨域 | `CorsConfig.java` | Spring Boot `WebMvcConfigurer`，允许 `/api/**` 跨域访问 |
| 后端接口 | `IndexController.java` | **`GET /api/index/recommend`** — 查询 `is_recommend=1` 的推荐商品，纯 JDBC `RowMapper` 手动映射 |
| 全局样式 | `common.css` | 约 400 行 CSS：毛玻璃导航、Hero大屏、分类药丸、商品卡片网格、规格选择器、按钮系统、响应式断点 |
| 首页前端 | `index.html` | Hero Banner（三层渐变色 + 浮动卡片动画）、分类导航药丸、推荐商品 4 列网格、CTA Banner |
| 首页逻辑 | `index.js` | Ajax 加载推荐商品 + emoji 占位渲染 + 滚动阴影控制 |
| 模型类 | `Product.java` | 商品实体类（纯 POJO） |

#### 核心代码特征

```
IndexController.java
  └── @GetMapping("/recommend")
      └── jdbcTemplate.query(sql, new ProductRowMapper())
          └── RowMapper 实现 ResultSet → Product 的手动映射

common.css
  └── :root { --color-primary: #0D9488; ... }
  └── .desktop-header { backdrop-filter: blur(20px); }
  └── .product-card:hover { transform: translateY(-6px); }
  └── @keyframes floatCard { ... } 浮动动画

index.js
  └── 商品图片缺失时 → emoji 占位（🧋🍵🥤🧊🍋🫧）
  └── $(window).scroll() → toggleClass('scrolled')
```

---

### 👤 成员 2 — 分类页与接口

#### 负责内容

| 类别 | 文件 | 说明 |
|------|------|------|
| 模型类 | `Category.java` | 分类实体（id, name） |
| 后端接口 | `CategoryController.java` | **`GET /api/categories`** — 查询所有分类；**`GET /api/categories/{id}/products`** — 按分类查询商品（id=0 返回全部） |
| 分类页前端 | `category.html` | 左侧图标侧边栏 + 右侧 3 列商品网格 |
| 分类页逻辑 | `category.js` | Ajax 加载分类列表 → 动态渲染侧边栏 → 点击切换分类 → 无刷新更新商品；支持 URL 参数 `?cid=1` 指定默认分类；`isRecommend=1` 商品显示推荐角标 |

#### 核心代码特征

```
CategoryController.java
  └── @GetMapping("/categories") → jdbcTemplate.query(SELECT * FROM categories)
  └── @GetMapping("/categories/{id}/products")
      └── id == 0 → 查询全部，id > 0 → WHERE category_id = ?

category.js
  └── loadCategories() → renderCategories() → 追加 cs-item
  └── switchCategory(id) → 高亮切换 + loadProducts(id)
  └── 分类图标映射：果茶 🍋 / 奶茶 🧋 / 咖啡 ☕ / 小食 🍟
```

---

### 👤 成员 3 — 商品详情与下单

#### 负责内容

| 类别 | 文件 | 说明 |
|------|------|------|
| 后端接口 | `ProductController.java` | **`GET /api/products/{id}`** — 查询单个商品详情 |
| 后端接口 | `OrderController.java` | **`POST /api/orders/create`** — 创建订单（**JDBC 编程式事务**） |
| 详情页前端 | `detail.html` | 左右分栏（左大图 + 右信息面板）、规格选择器（甜度/冰量/数量）、下单栏 |
| 详情页逻辑 | `detail.js` | Ajax 加载商品详情 → emoji 品类标签 → 规格切换 → 数量加减 → 登录校验 → 提交订单 |

#### 🔑 关键技术：JDBC 编程式事务

```java
// OrderController.java — createOrder 方法
Integer orderId = transactionTemplate.execute(new TransactionCallback<Integer>() {
    @Override
    public Integer doInTransaction(TransactionStatus status) {
        // 步骤 1：逐商品查询价格 + 校验库存
        for (item : items) {
            product = jdbcTemplate.queryForMap("SELECT price, stock FROM products WHERE id = ?", productId);
            if (stock < quantity) throw new RuntimeException("库存不足");  // ← 触发回滚
            totalPrice += price * quantity;
        }
        // 步骤 2：插入订单主表
        jdbcTemplate.update("INSERT INTO orders (...) VALUES (...)");
        // 步骤 3：获取自增 ID
        newOrderId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Integer.class);
        // 步骤 4：插入订单明细 + 扣减库存
        for (item : items) {
            jdbcTemplate.update("INSERT INTO order_items (...)");
            jdbcTemplate.update("UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?");
        }
        return newOrderId;  // ← 全部成功才提交
    }
});
```

**事务保证**：查价 → 验库存 → 创建订单 → 插入明细 → 扣库存，全部在同一事务中完成。任一步骤失败则全部回滚。

#### 前端交互细节

- 甜度：全糖 / 半糖 / 无糖（`spec-opt.active` 切换）
- 冰量：正常 / 少冰 / 去冰
- 数量：`btnMinus` / `btnPlus`，最低 1 / 最高为当前库存量
- 下单前自动调用 `GET /api/user/current` 校验登录状态
- 未登录时跳转登录页（带 `?redirect=` 参数）

---

### 👤 成员 4 — 全部商品瀑布流

#### 负责内容

| 类别 | 文件 | 说明 |
|------|------|------|
| 后端接口 | `ProductController.java` | **`GET /api/products/all`** — 分页查询 + 关键字模糊搜索 |
| 全部商品前端 | `list.html` | 搜索栏 + 4 列商品网格 + 滚动无限加载 |
| 全部商品逻辑 | `list.js` | Ajax 分页加载 + 关键字搜索 + 滚动触底自动加载下一页 + emoji 占位 |

#### 🔑 关键技术：分页 + 模糊搜索

```java
// ProductController.java — getAllProducts
@GetMapping("/all")
public Map<String, Object> getAllProducts(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int size,
        @RequestParam(required = false) String keyword) {

    // 动态 SQL 拼接
    StringBuilder countSql = new StringBuilder("SELECT COUNT(*) FROM products WHERE 1=1");
    if (keyword != null && !keyword.trim().isEmpty()) {
        countSql.append(" AND name LIKE ?");
    }
    // 分页：LIMIT ? OFFSET ?
    dataSql.append(" ORDER BY id DESC LIMIT ? OFFSET ?");

    int total = jdbcTemplate.queryForObject(countSql.toString(), Integer.class, params);
    List<Product> list = jdbcTemplate.query(dataSql.toString(), new ProductRowMapper(), dataParams);

    // 返回分页元数据
    result.put("data", { list, total, page, size, totalPages, hasMore });
}
```

#### 前端交互细节

- 搜索：输入框回车或点击搜索按钮，重新加载第 1 页
- 滚动加载：最后一张卡片进入可视区时自动 `page++` + Ajax 追加
- 防抖：150ms `setTimeout` 防止重复触发
- 12 条/页，4 列网格布局

---

### 👤 成员 5 — 个人中心与登录

#### 负责内容

| 类别 | 文件 | 说明 |
|------|------|------|
| 模型类 | `User.java`、`Order.java`、`OrderItem.java` | 用户、订单、订单明细实体 |
| 后端接口 | `UserController.java` | **`POST /api/user/login`**（Session 登录）、**`POST /api/user/logout`**（销毁 Session）、**`GET /api/user/current`**（获取当前用户） |
| 后端接口 | `OrderController.java` | **`GET /api/orders/my`** — 查询当前用户的订单列表（含 JOIN 关联的商品名/价格） |
| 登录页前端 | `login.html` | 左右分屏（品牌渐变视觉 + 表单面板），内嵌登录 JS |
| 个人中心前端 | `profile.html` | 左信息栏（头像/地址/功能菜单）+ 右订单卡片网格 |
| 个人中心逻辑 | `profile.js` | 页面加载时校验登录状态 → 加载我的订单 → 退出登录 |

#### 🔑 关键技术：Session 登录态

```java
// UserController.java — 登录
@PostMapping("/login")
public Map login(@RequestBody Map<String,String> body, HttpSession session) {
    List<User> users = jdbcTemplate.query("SELECT * FROM users WHERE username=? AND password=?", ...);
    if (users.isEmpty()) return {code:401, message:"用户名或密码错误"};
    User user = users.get(0);
    user.setPassword(null);                         // ← 不返回密码
    session.setAttribute("loginUser", user);        // ← 存入 Session
    return {code:200, data: user};
}

// 退出
@PostMapping("/logout")
public Map logout(HttpSession session) {
    session.invalidate();                           // ← 销毁 Session
    return {code:200, message:"已退出登录"};
}
```

#### 前端登录态校验流程

```
profile.js init()
  ↓
GET /api/user/current
  ├─ 200 (已登录) → showLoggedIn() → 显示用户信息 + 订单列表
  └─ 401 (未登录) → showLoggedOut() → 显示登录引导
```

#### 我的订单 — SQL JOIN 查询

```java
// OrderController.java — getMyOrders
String sql = "SELECT oi.*, p.name AS product_name, p.price AS product_price, "
           + "p.image_url AS product_image_url "
           + "FROM order_items oi JOIN products p ON oi.product_id = p.id "
           + "WHERE oi.order_id = ?";
```

---

## 四、完整 API 接口清单

| 序号 | 接口 | 方法 | 所属模块 | 功能说明 |
|------|------|------|----------|----------|
| 1 | `/api/index/recommend` | GET | M1·组长 | 首页推荐商品（is_recommend=1） |
| 2 | `/api/categories` | GET | M2·成员2 | 获取所有分类 |
| 3 | `/api/categories/{id}/products` | GET | M2·成员2 | 按分类查商品（id=0→全部） |
| 4 | `/api/products/{id}` | GET | M3·成员3 | 商品详情 |
| 5 | `/api/orders/create` | POST | M3·成员3 | 创建订单（编程式事务） |
| 6 | `/api/products/all` | GET | M4·成员4 | 分页 + 关键字搜索 |
| 7 | `/api/user/login` | POST | M5·成员5 | 用户登录（Session） |
| 8 | `/api/user/logout` | POST | M5·成员5 | 用户登出 |
| 9 | `/api/user/current` | GET | M5·成员5 | 当前登录用户信息 |
| 10 | `/api/orders/my` | GET | M5·成员5 | 我的订单（含明细） |

---

## 五、技术要点汇总

### 后端

| 技术 | 用途 |
|------|------|
| **Spring Boot 3.2** | 应用框架，内嵌 Tomcat，自动配置 |
| **Spring JDBC (JdbcTemplate)** | 纯 SQL 操作，无 ORM，适合教学演示 |
| **TransactionTemplate** | 编程式事务管理，保证下单流程原子性 |
| **HikariCP** | 数据库连接池（Spring Boot 默认） |
| **HttpSession** | 用户登录状态管理 |
| **RowMapper** | 手动 ResultSet → JavaBean 映射 |
| **动态 SQL** | StringBuilder 拼接实现分页搜索 |
| **CorsConfig** | 开发阶段跨域支持 |

### 前端

| 技术 | 用途 |
|------|------|
| **Bootstrap 3** | 栅格系统基础样式 |
| **Font Awesome 4** | 矢量图标库 |
| **jQuery 1.12** | DOM 操作 + Ajax 异步请求 |
| **Ajax (XMLHttpRequest)** | 无刷新数据交互 |
| **CSS Grid** | 4 列 / 3 列商品网格布局 |
| **CSS Flexbox** | 分栏布局（分类页、详情页、个人中心） |
| **CSS 动画** | @keyframes 浮动卡片、悬停过渡效果 |
| **backdrop-filter** | 导航栏毛玻璃效果 |
| **CSS 变量** | 全局主题色系统 `:root { --color-primary: ... }` |
| **CSS 渐变** | Hero 大屏、CTA Banner、按钮、图标 |

### 数据库

| 技术 | 用途 |
|------|------|
| **MySQL 8.0** | 关系型数据库 |
| **InnoDB** | 事务引擎，支持外键和行级锁 |
| **utf8mb4** | 字符集，支持 emoji |
| **外键约束** | products→categories, orders→users, order_items→orders+products |
| **自增主键** | AUTO_INCREMENT |
| **LAST_INSERT_ID()** | 获取事务中新插入的订单 ID |

---

## 六、项目文件清单

```
奶茶点单系统/
├── pom.xml                                    # Maven 项目配置
├── schema.sql                                 # 数据库初始化脚本
├── 项目总结.md                                # 本文件
│
└── src/main/
    ├── java/com/sweettea/
    │   ├── SweetTeaApplication.java           # Spring Boot 启动入口
    │   ├── config/
    │   │   └── CorsConfig.java                # 跨域配置
    │   ├── model/
    │   │   ├── Product.java                   # 商品模型
    │   │   ├── Category.java                  # 分类模型
    │   │   ├── Order.java                     # 订单模型
    │   │   ├── OrderItem.java                 # 订单明细模型
    │   │   └── User.java                      # 用户模型
    │   └── controller/
    │       ├── IndexController.java           # M1 首页推荐接口
    │       ├── CategoryController.java        # M2 分类接口
    │       ├── ProductController.java         # M3+M4 商品详情+分页搜索
    │       ├── OrderController.java           # M3+M5 创建订单+我的订单
    │       └── UserController.java            # M5 登录/登出
    │
    └── resources/
        ├── application.properties             # 应用配置
        └── static/
            ├── index.html                     # M1 首页
            ├── category.html                  # M2 分类页
            ├── detail.html                    # M3 商品详情页
            ├── list.html                      # M4 全部商品页
            ├── login.html                     # M5 登录页
            ├── profile.html                   # M5 个人中心
            ├── css/
            │   └── common.css                 # 全局样式（~700行）
            └── js/
                ├── index.js                   # M1 首页逻辑
                ├── category.js                # M2 分类逻辑
                ├── detail.js                  # M3 详情+下单逻辑
                ├── list.js                    # M4 瀑布流逻辑
                └── profile.js                 # M5 个人中心逻辑
```

> **总计**：5 个后端控制器 + 5 个模型类 + 1 个配置类 + 6 个 HTML 页面 + 1 个 CSS 文件 + 5 个 JS 文件

---

## 七、启动与运行

```bash
# 1. 初始化数据库
mysql -u root -p < schema.sql

# 2. 修改 application.properties 中的数据库密码

# 3. 启动项目
mvn spring-boot:run

# 4. 浏览器访问
http://localhost:8080

# 5. 测试账号
用户名: testuser    密码: 123456
```

---

## 八、项目亮点

1. **纯 JDBC 无 ORM**：所有 SQL 手动编写，`RowMapper` 手动映射，便于理解底层数据库操作原理
2. **编程式事务**：下单流程使用 `TransactionTemplate`，清晰展示事务边界与回滚机制
3. **Session 认证**：基于 `HttpSession` 的用户登录态管理，代码简洁直观
4. **原生前端无框架**：全部使用 HTML5 + CSS3 + jQuery + Ajax，适合教学演示与学习
5. **完整的电商流程**：浏览分类 → 查看详情 → 选择规格 → 登录 → 下单 → 查看订单，覆盖完整业务链
6. **毛玻璃 + CSS 动画**：`backdrop-filter` 导航栏、`@keyframes` 浮动卡片、`transition` 悬停效果
7. **响应式适配**：4 档断点（1100/860/520px），桌面/平板/手机均可使用
8. **emoji 友好**：图片缺失时自动显示 emoji 占位符，提升用户体验
9. **安全基础**：密码不返回到前端、XSS 防护 `escapeHtml()`、库存扣减带 `WHERE stock >= ?` 防超卖
10. **代码规范**：类名、变量名语义化，注释完整，模块边界清晰

---

> 🤖 本项目由小组 5 名成员协作完成，用于软件工程课程期末答辩演示。
