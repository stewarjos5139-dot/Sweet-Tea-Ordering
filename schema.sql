-- =============================================
-- 甜趣奶茶点单系统 - 数据库初始化脚本
-- 数据库: sweet_tea_db
-- =============================================

CREATE DATABASE IF NOT EXISTS sweet_tea_db
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE sweet_tea_db;

-- -----------------------------------------
-- 1. 用户表
-- -----------------------------------------
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    username   VARCHAR(50)  NOT NULL UNIQUE,
    password   VARCHAR(100) NOT NULL,
    address    VARCHAR(200) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------
-- 2. 分类表
-- -----------------------------------------
CREATE TABLE categories (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------
-- 3. 商品表
-- -----------------------------------------
CREATE TABLE products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT            NOT NULL,
    name        VARCHAR(100)   NOT NULL,
    description VARCHAR(500)   DEFAULT '',
    price       DECIMAL(10,2)  NOT NULL,
    image_url   VARCHAR(300)   DEFAULT '',
    stock       INT            DEFAULT 0,
    is_recommend TINYINT(1)    DEFAULT 0,
    FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------
-- 4. 订单表
-- -----------------------------------------
CREATE TABLE orders (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT            NOT NULL,
    total_price DECIMAL(10,2)  NOT NULL,
    status      VARCHAR(20)    DEFAULT 'pending',
    create_time DATETIME       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------
-- 5. 订单详情表
-- -----------------------------------------
CREATE TABLE order_items (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    order_id   INT            NOT NULL,
    product_id INT            NOT NULL,
    quantity   INT            DEFAULT 1,
    sweetness  VARCHAR(20)    DEFAULT '全糖',
    ice_level  VARCHAR(20)    DEFAULT '正常',
    FOREIGN KEY (order_id)   REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 初始示例数据
-- =============================================

-- 用户
INSERT INTO users (username, password, address) VALUES
('testuser', '123456', '北京市朝阳区xxx路100号');

-- 分类
INSERT INTO categories (name) VALUES
('果茶'),
('奶茶'),
('咖啡'),
('小食');

-- 商品（所有图片使用占位图，后续可替换）
INSERT INTO products (category_id, name, description, price, image_url, stock, is_recommend) VALUES
-- 果茶 (category_id=1)
(1, '满杯百香果', '新鲜百香果搭配茉莉绿茶，酸甜清爽', 16.00, 'images/drinks/baixiangguo.jpg', 100, 1),
(1, '霸气橙子', '整颗鲜橙切片，满口维C果汁', 18.00, 'images/drinks/chengzi.jpg', 100, 1),
(1, '葡萄冻冻', '手剥葡萄果肉，Q弹果冻打底', 19.00, 'images/drinks/putao.jpg', 100, 1),
(1, '杨枝甘露', '经典港式甜品，芒果椰奶西柚粒', 20.00, 'images/drinks/yangzhi.jpg', 80, 1),

-- 奶茶 (category_id=2)
(2, '珍珠奶茶', '经典台式珍珠奶茶，Q弹有嚼劲', 14.00, 'images/drinks/zhenzhu.jpg', 150, 1),
(2, '红豆奶茶', '软糯红豆搭配浓郁奶茶', 15.00, 'images/drinks/hongdou.jpg', 120, 1),
(2, '芋泥波波奶茶', '绵密芋泥+黑糖波波，冬日暖饮首选', 18.00, 'images/drinks/yuni.jpg', 100, 1),
(2, '焦糖奶茶', '焦糖风味，甜而不腻', 13.00, 'images/drinks/jiaotang.jpg', 130, 0),

-- 咖啡 (category_id=3)
(3, '经典美式', '精选阿拉比卡豆，纯正美式风味', 15.00, 'images/drinks/meishi.jpg', 90, 1),
(3, '拿铁咖啡', '意式浓缩+醇香牛奶，丝滑顺口', 18.00, 'images/drinks/latte.jpg', 90, 1),
(3, '生椰拿铁', '椰乳搭配浓缩咖啡，清爽提神', 19.00, 'images/drinks/shengye.jpg', 80, 0),
(3, '卡布奇诺', '奶泡绵密，经典意大利风味', 17.00, 'images/drinks/kabuqinuo.jpg', 70, 0),

-- 小食 (category_id=4)
(4, '鸡米花', '金黄酥脆，一口一个停不下来', 10.00, 'images/food/jimihua.jpg', 60, 0),
(4, '薯条', '粗切薯条，外酥里糯', 9.00, 'images/food/shutiao.jpg', 60, 0),
(4, '提拉米苏', '经典意式甜点，咖啡与奶酪的邂逅', 15.00, 'images/food/tilaimisu.jpg', 40, 0),
(4, '抹茶蛋糕', '日式抹茶风味，清新不腻', 14.00, 'images/food/mocha.jpg', 40, 0);
