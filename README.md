# 电影票抽奖系统

一个完整的电影票抽奖系统，包含微信小程序端和管理后台。

## 项目结构

```
choujiang-main/
├── mini-program/               # 微信小程序（Taro + React）
│   ├── src/
│   │   ├── pages/
│   │   │   ├── home/          # 首页
│   │   │   ├── upload/        # 上传票根
│   │   │   ├── records/       # 抽奖记录
│   │   │   ├── profile/       # 个人中心
│   │   │   └── lottery/       # 抽奖页面
│   │   └── ...
│   ├── cloudfunctions/        # 微信云函数
│   │   ├── login/
│   │   ├── uploadTicketStub/
│   │   ├── getTicketStubs/
│   │   ├── doLottery/
│   │   └── getLotteryRecords/
│   ├── config/
│   ├── types/
│   ├── package.json
│   └── tsconfig.json
├── admin-backend/             # Spring Boot 3 管理后端
│   └── src/
│       ├── main/
│       │   ├── java/com/choujiang/
│       │   │   ├── entity/
│       │   │   ├── mapper/
│       │   │   ├── service/
│       │   │   ├── controller/
│       │   │   ├── dto/
│       │   │   ├── config/
│       │   │   ├── util/
│       │   │   └── LotteryAdminApplication.java
│       │   └── resources/
│       │       ├── application.yml
│       │       └── sql/
│       └── pom.xml
└── admin-frontend/            # Vue 3 管理前端
    ├── src/
    │   ├── views/
    │   │   ├── Login.vue
    │   │   ├── Dashboard.vue
    │   │   ├── Users.vue
    │   │   ├── Tickets.vue
    │   │   └── Lotteries.vue
    │   ├── layouts/
    │   │   └── Layout.vue
    │   ├── router/
    │   │   └── index.js
    │   ├── api/
    │   │   └── index.js
    │   ├── App.vue
    │   └── main.js
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## 技术栈

### 小程序端
- Taro 3.6
- React 18
- TypeScript
- 微信云开发

### 管理后端
- Spring Boot 3.2
- MyBatis-Plus
- JWT
- MySQL 8
- POI（Excel导出）

### 管理前端
- Vue 3
- Vite
- Element Plus
- ECharts
- Axios

## 快速开始

### 1. 数据库准备

首先创建数据库：

```sql
-- 执行 admin-backend/src/main/resources/sql/init.sql
```

### 2. 后端启动

```bash
cd admin-backend

# 配置 application.yml 中的数据库连接
# 修改数据库地址、用户名、密码

# 启动项目
mvn spring-boot:run
```

后端服务将在 http://localhost:8080 启动

### 3. 前端启动

```bash
cd admin-frontend

# 安装依赖
npm install

# 启动开发服务
npm run dev
```

前端服务将在 http://localhost:3000 启动

### 4. 小程序启动

```bash
cd mini-program

# 安装依赖
npm install

# 启动开发服务
npm run dev:weapp
```

使用微信开发者工具打开 `mini-program/dist` 目录

## 默认账号

- 用户名：admin
- 密码：admin123

## 功能特点

### 小程序端
1. 用户通过微信登录
2. 拍照或选择相册中的电影票根上传
3. 自动识别电影信息
4. 参与抽奖
5. 查看抽奖记录
6. 个人信息管理

### 管理后台
1. 数据看板（统计信息 + 图表
2. 用户管理
3. 票根管理
4. 抽奖记录管理
5. 数据导出 Excel
