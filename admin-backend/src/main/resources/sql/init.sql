-- 创建数据库
CREATE DATABASE IF NOT EXISTS lottery_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE lottery_db;

-- 管理员表
CREATE TABLE IF NOT EXISTS admin_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    nickname VARCHAR(50) COMMENT '昵称',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记 0-未删除 1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';

-- 小程序用户表
CREATE TABLE IF NOT EXISTS mini_user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    openid VARCHAR(100) NOT NULL UNIQUE COMMENT '微信OpenID',
    unionid VARCHAR(100) COMMENT '微信UnionID',
    nickname VARCHAR(50) COMMENT '微信昵称',
    avatar VARCHAR(255) COMMENT '头像',
    phone VARCHAR(20) COMMENT '手机号码',
    id_card VARCHAR(18) COMMENT '身份证号',
    has_bind_id_card TINYINT DEFAULT 0 COMMENT '是否绑定身份证 0-未绑定 1-已绑定',
    has_won TINYINT DEFAULT 0 COMMENT '是否已中奖 0-未中奖 1-已中奖',
    ticket_count INT DEFAULT 0 COMMENT '上传票根数量',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记 0-未删除 1-已删除',
    INDEX idx_openid (openid),
    INDEX idx_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='小程序用户表';

-- 电影票根表
CREATE TABLE IF NOT EXISTS ticket_stub (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    image_url VARCHAR(500) COMMENT '图片URL',
    movie_name VARCHAR(100) COMMENT '电影名称',
    show_time DATETIME COMMENT '放映时间',
    cinema VARCHAR(100) COMMENT '影院名称',
    cinema_location VARCHAR(200) COMMENT '影院位置',
    seat VARCHAR(50) COMMENT '座位号',
    ticket_hash VARCHAR(100) NOT NULL UNIQUE COMMENT '票根哈希值（用于去重）',
    is_valid TINYINT DEFAULT 1 COMMENT '是否有效 0-无效 1-有效',
    is_used_for_lottery TINYINT DEFAULT 0 COMMENT '是否已用于抽奖 0-未使用 1-已使用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记 0-未删除 1-已删除',
    INDEX idx_user_id (user_id),
    INDEX idx_ticket_hash (ticket_hash),
    INDEX idx_show_time (show_time),
    INDEX idx_is_valid (is_valid),
    INDEX idx_is_used_for_lottery (is_used_for_lottery)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='电影票根表';

-- 奖项配置表
CREATE TABLE IF NOT EXISTS prize (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(50) NOT NULL COMMENT '奖项名称',
    description VARCHAR(255) COMMENT '奖项描述',
    image VARCHAR(500) COMMENT '奖项图片',
    probability DECIMAL(5,4) NOT NULL COMMENT '中奖概率',
    stock INT DEFAULT 0 COMMENT '库存',
    sort INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记 0-未删除 1-已删除'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='奖项配置表';

-- 抽奖配置表
CREATE TABLE IF NOT EXISTS lottery_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    name VARCHAR(100) NOT NULL COMMENT '抽奖活动名称',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    draw_time DATETIME NOT NULL COMMENT '开奖时间',
    status TINYINT DEFAULT 0 COMMENT '状态 0-未开始 1-进行中 2-已开奖',
    description VARCHAR(500) COMMENT '活动描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记 0-未删除 1-已删除',
    INDEX idx_status (status),
    INDEX idx_draw_time (draw_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='抽奖配置表';

-- 抽奖记录表
CREATE TABLE IF NOT EXISTS lottery_record (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    ticket_stub_id BIGINT COMMENT '票根ID',
    prize_id BIGINT COMMENT '奖项ID',
    prize_name VARCHAR(50) COMMENT '奖项名称',
    lottery_config_id BIGINT COMMENT '抽奖配置ID',
    is_win TINYINT DEFAULT 0 COMMENT '是否中奖 0-未中奖 1-中奖',
    is_claimed TINYINT DEFAULT 0 COMMENT '是否已兑奖 0-未兑奖 1-已兑奖',
    claim_time DATETIME COMMENT '兑奖时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    deleted TINYINT DEFAULT 0 COMMENT '删除标记 0-未删除 1-已删除',
    INDEX idx_user_id (user_id),
    INDEX idx_ticket_stub_id (ticket_stub_id),
    INDEX idx_lottery_config_id (lottery_config_id),
    INDEX idx_is_win (is_win),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='抽奖记录表';

-- 初始化抽奖配置
INSERT INTO lottery_config (name, draw_time, status, description) VALUES
('暑期观影抽奖活动', DATE_ADD(NOW(), INTERVAL 7 DAY), 1, '上传电影票根参与抽奖，有机会获得免费电影票、爆米花等精美礼品！');

-- 初始化管理员账号（密码：admin123，使用BCrypt加密后的值）
-- 这是 admin123 的 BCrypt 加密值
INSERT INTO admin_user (username, password, nickname) VALUES
('admin', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubkHNlKx3q.4.8zBzOa7Cw7Kq', '超级管理员');


-- 初始化奖项配置
INSERT INTO prize (name, description, probability, stock, sort) VALUES
('一等奖-免费电影票', '获得免费电影票一张', 0.0100, 10, 1),
('二等奖-爆米花', '获得爆米花一份', 0.0500, 100, 2),
('三等奖-优惠券', '获得30元优惠券', 0.1000, 500, 3),
('纪念奖-海报', '获得电影海报一张', 0.2000, 1000, 4),
('谢谢参与', '感谢您的参与', 0.6400, 999999, 5);
