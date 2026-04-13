# AI 术语通小程序 - 技术设计方案

**版本**: 1.0  
**日期**: 2026-04-13  
**开发模式**: 7 天敏捷冲刺

---

## 🛠️ 技术栈

### 前端
| 技术 | 选型 | 说明 |
|------|------|------|
| 框架 | 微信小程序原生 | 无需额外框架 |
| 语言 | ES6+ JavaScript | 箭头函数、async/await |
| 样式 | WXSS | rpx 响应式单位 |
| 状态管理 | 原生 setData | 数据路径优化 |

### 后端
| 技术 | 选型 | 说明 |
|------|------|------|
| 方案 | 微信云开发 | 免服务器运维 |
| 数据库 | 云数据库 | JSON 文档型 |
| 云函数 | 云函数 2.0 | 登录 + 统计 |
| 存储 | 云存储 | 图片/文件 |

---

## 📁 项目结构

```
ai-terms-miniprogram/
├── app.js                    # 小程序入口
├── app.json                  # 全局配置
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置
├── project.private.config.json # 私有配置 (gitignore)
│
├── cloud/                    # 云函数目录
│   ├── login/               # 登录云函数
│   │   ├── index.js
│   │   └── package.json
│   └── stats/               # 统计云函数
│       ├── index.js
│       └── package.json
│
├── pages/                    # 页面目录
│   ├── index/               # 首页 (卡片列表)
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   │
│   ├── detail/              # 术语详情页
│   │   ├── detail.js
│   │   ├── detail.json
│   │   ├── detail.wxml
│   │   └── detail.wxss
│   │
│   ├── quiz/                # 测验页面
│   │   ├── quiz.js
│   │   ├── quiz.json
│   │   ├── quiz.wxml
│   │   └── quiz.wxss
│   │
│   └── collection/          # 收藏页面
│       ├── collection.js
│       ├── collection.json
│       ├── collection.wxml
│       └── collection.wxss
│
├── components/               # 自定义组件
│   ├── term-card/           # 术语卡片组件
│   │   ├── index.js
│   │   ├── index.json
│   │   ├── index.wxml
│   │   └── index.wxss
│   │
│   └── progress-bar/        # 进度条组件
│       ├── index.js
│       ├── index.json
│       ├── index.wxml
│       └── index.wxss
│
├── utils/                    # 工具函数
│   ├── api.js               # 云开发 API 封装
│   ├── storage.js           # 本地存储封装
│   ├── date.js              # 日期处理 (iOS 兼容)
│   └── constants.js         # 常量配置
│
└── data/                     # 静态数据
    └── terms.json           # AI 术语库 (50 词)
```

---

## 🗄️ 数据库设计

### 集合 1: terms (术语库)

```json
{
  "_id": "term_001",
  "name": "机器学习",
  "nameEn": "Machine Learning",
  "category": "基础概念",
  "definition": "机器学习是人工智能的一个分支，它让计算机能够从数据中学习，而无需显式编程。",
  "example": "比如：给计算机看很多猫的图片，它能学会识别新的图片中是否有猫。",
  "difficulty": 1,
  "tags": ["AI", "基础", "热门"],
  "createdAt": 1712995200000,
  "updatedAt": 1712995200000
}
```

### 集合 2: users (用户数据)

```json
{
  "_id": "user_openid_xxx",
  "openId": "oXXXX-用户 OpenID",
  "nickName": "用户昵称",
  "avatarUrl": "头像 URL",
  "learnedTerms": ["term_001", "term_002"],
  "collectedTerms": ["term_001"],
  "quizScores": [
    { "date": "2026-04-13", "score": 8, "total": 10 }
  ],
  "createdAt": 1712995200000,
  "lastLoginAt": 1712995200000
}
```

### 集合 3: quiz_questions (测验题目)

```json
{
  "_id": "quiz_001",
  "termId": "term_001",
  "question": "以下哪个是机器学习的正确定义？",
  "options": [
    "让计算机从数据中学习",
    "给计算机编写固定规则",
    "让计算机自动上网",
    "给计算机安装更多内存"
  ],
  "answer": 0,
  "explanation": "机器学习的核心是让计算机从数据中学习规律，而不是手动编写规则。",
  "difficulty": 1
}
```

---

## 🔌 API 接口设计

### 云函数 1: login

**功能**: 用户登录 + 获取/创建用户数据

**输入**:
```json
{ "userInfo": { "nickName": "xxx", "avatarUrl": "xxx" } }
```

**输出**:
```json
{
  "success": true,
  "user": { "openId": "xxx", "nickName": "xxx", ... }
}
```

### 云函数 2: stats

**功能**: 学习统计

**输入**:
```json
{ "action": "getStats" | "updateProgress" }
```

**输出**:
```json
{
  "learnedCount": 10,
  "collectedCount": 5,
  "quizAvgScore": 8.5
}
```

### 小程序端 API 封装 (utils/api.js)

```javascript
// 获取术语列表
export function getTermList(page = 1, pageSize = 10) {}

// 获取术语详情
export function getTermDetail(termId) {}

// 收藏/取消收藏
export function toggleCollect(termId) {}

// 标记已学
export function markLearned(termId) {}

// 获取收藏列表
export function getCollectedTerms() {}

// 获取测验题目
export function getQuizQuestions(limit = 10) {}

// 提交测验答案
export function submitQuiz(answers) {}
```

---

## 🎨 页面路由配置 (app.json)

```json
{
  "pages": [
    "pages/index/index",
    "pages/detail/detail",
    "pages/quiz/quiz",
    "pages/collection/collection"
  ],
  "window": {
    "navigationBarBackgroundColor": "#07c160",
    "navigationBarTitleText": "AI 术语通",
    "navigationBarTextStyle": "white",
    "backgroundColor": "#f5f5f5"
  },
  "tabBar": {
    "color": "#999",
    "selectedColor": "#07c160",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "学习",
        "iconPath": "images/learn.png",
        "selectedIconPath": "images/learn-active.png"
      },
      {
        "pagePath": "pages/quiz/quiz",
        "text": "测验",
        "iconPath": "images/quiz.png",
        "selectedIconPath": "images/quiz-active.png"
      },
      {
        "pagePath": "pages/collection/collection",
        "text": "收藏",
        "iconPath": "images/collection.png",
        "selectedIconPath": "images/collection-active.png"
      }
    ]
  },
  "cloud": true
}
```

---

## ⚠️ 开发注意事项

### iOS 兼容性
```javascript
// ❌ 错误写法
new Date('2026-04-13')  // iOS 不支持横杠

// ✅ 正确写法
new Date('2026/04/13')  // 或
new Date('2026-04-13'.replace(/-/g, '/'))
```

### setData 优化
```javascript
// ❌ 全量更新 (性能差)
this.setData({ list: newList })

// ✅ 数据路径更新 (性能好)
this.setData({ 'list[0].name': '新名称' })
```

### 单位使用
```css
/* ✅ 使用 rpx (响应式) */
.container { width: 750rpx; }

/* ❌ 避免使用 px */
.container { width: 375px; }
```

---

## 📝 开发检查清单

### Day 1 检查项
- [ ] 微信开发者工具已安装
- [ ] AppID 已配置
- [ ] 云开发已开通
- [ ] 项目目录已创建
- [ ] app.json 配置完成
- [ ] 4 个基础页面已创建

### 每日检查项
- [ ] 代码提交 Git
- [ ] 真机预览测试
- [ ] 控制台无报错

---

**最后更新**: 2026-04-13  
**状态**: 技术方案确认，准备开发
