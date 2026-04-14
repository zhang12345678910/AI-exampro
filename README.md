# AI 词星球小程序

> 基于最新 PRD V1.0 重新设计 - 微信小程序

**一个通俗易懂的 AI 术语学习小程序**

---

## 📱 项目简介

AI 词星球是一个专注于人工智能领域术语学习的微信小程序，通过卡片学习、分级学习、小测验等方式，帮助用户轻松理解 AI/ML/DL 相关概念。

### 核心功能
- 🏠 **首页模块** - 每日一词、搜索、分类入口、热门推荐
- 📖 **词典模块** - 1000+AI 名词、3 种检索方式、分类筛选
- 📚 **学习模块** - 分级学习（入门/进阶/专业）、每日打卡、小测验
- 👤 **我的模块** - 个人信息、收藏夹、生词本、笔记、勋章墙
- 🎴 **工具模块** - 名词卡片生成、多场景分享

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 微信小程序原生框架 + ES6+ JavaScript |
| 后端 | 微信云开发 (Cloud Base) |
| 数据库 | 云数据库 (JSON 文档型) |
| 云函数 | 登录、统计、每日一词、打卡、测验等 |

---

## 📁 项目结构

```
ai-terms-miniprogram/
├── app.js                    # 小程序入口
├── app.json                  # 全局配置
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置
├── sitemap.json              # 站点地图
│
├── cloud/                    # 云函数
│   ├── login/               # 用户登录
│   ├── stats/               # 学习统计
│   ├── getDailyWord/        # 每日一词
│   ├── checkIn/             # 每日打卡
│   └── submitQuiz/          # 提交测验
│
├── pages/                    # 页面
│   ├── index/               # 首页（每日一词 + 搜索 + 分类）
│   ├── detail/              # 术语详情
│   ├── quiz/                # 小测验
│   ├── collection/          # 收藏夹
│   ├── dictionary/          # 词典模块
│   │   ├── list/            # 名词列表
│   │   └── detail/          # 名词详情
│   ├── learning/            # 学习模块
│   │   ├── level/           # 分级学习
│   │   ├── detail/          # 学习详情
│   │   ├── quiz/            # 测验
│   │   └── checkin/         # 打卡日历
│   └── profile/             # 我的模块
│       ├── index/           # 个人中心
│       ├── collection/      # 收藏夹
│       ├── unknown/         # 生词本
│       ├── notes/           # 笔记管理
│       ├── stats/           # 学习记录
│       ├── badges/          # 勋章墙
│       └── settings/        # 设置
│
├── components/               # 自定义组件
│   ├── term-card/           # 术语卡片
│   ├── progress-bar/        # 进度条
│   ├── checkin-calendar/    # 打卡日历
│   └── share-card/          # 分享卡片
│
├── utils/                    # 工具函数
│   ├── api.js               # 云开发 API 封装
│   ├── storage.js           # 本地存储
│   ├── date.js              # 日期处理（iOS 兼容）
│   ├── pinyin.js            # 拼音转换
│   ├── canvas.js            # 画布工具
│   └── constants.js         # 常量配置
│
└── data/                     # 静态数据
    ├── terms.json           # AI 术语库 (50 词)
    ├── terms_v2.json        # 扩展术语库 (1000+ 词)
    └── categories.json      # 分类配置
```

---

## 🚀 快速开始

### 1. 准备工作
- 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
- 注册 [微信小程序账号](https://mp.weixin.qq.com/)
- 获取 AppID

### 2. 导入项目
1. 打开微信开发者工具
2. 选择「导入项目」
3. 选择项目目录：`ai-terms-miniprogram`
4. 填入你的 AppID
5. 点击「导入」

### 3. 配置云开发
1. 点击工具栏「云开发」按钮
2. 开通云开发环境
3. 创建数据库集合：`terms`、`users`、`quiz_questions`
4. 导入 `data/terms.json` 到 `terms` 集合
5. 上传云函数：`cloud/login` 和 `cloud/stats`

### 4. 修改配置
编辑 `project.config.json` 和 `app.js`，将云环境 ID 替换为你的实际环境 ID。

### 5. 运行预览
点击「编译」按钮，即可在模拟器中预览小程序。

---

## 📅 开发排期 (基于最新 PRD)

| 阶段 | 时间 | 主要任务 | 状态 |
|------|------|----------|------|
| **阶段一** | 第 1 周 | 首页 + 词典模块 | ⏳ 进行中 |
| **阶段二** | 第 2 周 | 学习模块（分级 + 打卡 + 测试） | ⏳ 待开始 |
| **阶段三** | 第 3 周 | 用户中心（完整功能） | ⏳ 待开始 |
| **阶段四** | 第 4 周 | 工具模块（卡片 + 分享） | ⏳ 待开始 |
| **阶段五** | 并行 | 数据扩展（1000+ 术语） | ⏳ 待开始 |
| **阶段六** | 并行 | UI/UX 优化 | ⏳ 待开始 |

### 版本规划
- **V1.0** (当前): MVP 版本，核心功能
- **V1.1** (2 周后): 首页 + 词典完整，术语库 200 词
- **V1.2** (4 周后): 所有 P0/P1 功能，术语库 500 词
- **V2.0** (6 周后): 完整功能，术语库 1000+ 词，准备上线

---

## 📊 数据库设计

### terms (术语库)
```json
{
  "_id": "term_001",
  "name": "机器学习",
  "nameEn": "Machine Learning",
  "category": "基础概念",
  "definition": "...",
  "example": "...",
  "difficulty": 1,
  "tags": ["ML", "基础", "核心"]
}
```

### users (用户数据)
```json
{
  "_id": "openid_xxx",
  "openId": "oXXXX-用户 OpenID",
  "nickName": "用户昵称",
  "learnedTerms": ["term_001"],
  "collectedTerms": ["term_001"],
  "quizScores": [{"score": 80, "total": 10}]
}
```

### quiz_questions (测验题目)
```json
{
  "_id": "quiz_001",
  "termId": "term_001",
  "question": "以下哪个是机器学习的正确定义？",
  "options": ["选项 A", "选项 B", "选项 C", "选项 D"],
  "answer": 0,
  "explanation": "解析..."
}
```

---

## 📝 开发注意事项

### iOS 兼容性
```javascript
// ❌ 错误
new Date('2026-04-13')

// ✅ 正确
new Date('2026/04/13')
// 或
new Date('2026-04-13'.replace(/-/g, '/'))
```

### setData 优化
```javascript
// ❌ 全量更新
this.setData({ list: newList })

// ✅ 数据路径更新
this.setData({ 'list[0].name': '新名称' })
```

### 单位使用
```css
/* ✅ 使用 rpx */
.container { width: 750rpx; }

/* ❌ 避免 px */
.container { width: 375px; }
```

---

## 📄 许可证

MIT License

---

## 👥 团队

- 开发：AI Assistant
- 产品：AI Assistant
- 设计：AI Assistant

---

**最后更新**: 2026-04-13  
**项目状态**: 开发中 (Day 1 完成)
