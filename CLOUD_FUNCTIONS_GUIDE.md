# 云函数部署指南

**更新日期**: 2026-04-15

---

## 📦 云函数清单

| 云函数名 | 功能 | 状态 |
|----------|------|------|
| getDailyWord | 获取每日一词 | ✅ 完成 |
| checkIn | 每日打卡 | ✅ 完成 |
| getTermList | 获取术语列表 | ✅ 完成 |
| getTermDetail | 获取术语详情 | ✅ 完成 |
| updateTermView | 更新浏览次数 | ✅ 完成 |

---

## 🚀 部署步骤

### 1. 准备工作

1. 开通微信云开发
2. 创建云环境
3. 创建数据库集合：
   - `terms` (术语库)
   - `users` (用户数据)
   - `daily_word` (每日一词)
   - `categories` (分类配置)
   - `badges` (勋章配置)
   - `quiz_questions` (测验题目)

### 2. 上传云函数

#### 方法一：微信开发者工具

1. 打开微信开发者工具
2. 点击工具栏「云开发」按钮
3. 进入「云函数」页面
4. 右键点击 `cloud/` 目录
5. 选择「上传并部署：云端安装依赖」
6. 等待上传完成

#### 方法二：命令行

```bash
# 进入云函数目录
cd cloud/getDailyWord

# 安装依赖
npm install

# 使用微信 CLI 工具上传
wx cloudfunctions deploy getDailyWord
```

### 3. 导入初始数据

#### 导入分类数据

1. 打开云开发控制台
2. 进入「数据库」→「categories」集合
3. 点击「导入」
4. 选择 `data/categories.json`
5. 确认导入

#### 导入勋章数据

1. 进入「数据库」→「badges」集合
2. 点击「导入」
3. 选择 `data/badges.json`
4. 确认导入

#### 导入术语数据

1. 进入「数据库」→「terms」集合
2. 点击「导入」
3. 选择 `data/terms.json`
4. 确认导入

---

## ⚙️ 云函数配置

### 环境变量

无需特殊环境变量配置。

### 权限配置

所有云函数使用默认权限即可：
- 用户可读写自己的数据
- 术语库为公共可读

### 超时配置

默认超时时间 (3 秒) 足够，无需调整。

---

## 📝 调用示例

### 获取每日一词

```javascript
wx.cloud.callFunction({
  name: 'getDailyWord',
  data: {
    date: '2026-04-15'  // 可选，默认今天
  }
}).then(res => {
  console.log(res.result);
  // { success: true, data: {...}, source: 'auto', date: '2026-04-15' }
});
```

### 每日打卡

```javascript
wx.cloud.callFunction({
  name: 'checkIn',
  data: {
    date: '2026-04-15',  // 可选
    nickName: '用户昵称',  // 新用户需要
    avatarUrl: '头像 URL'
  }
}).then(res => {
  console.log(res.result);
  // { success: true, continuousDays: 7, totalDays: 20, message: '打卡成功！' }
});
```

### 获取术语列表

```javascript
wx.cloud.callFunction({
  name: 'getTermList',
  data: {
    page: 1,
    pageSize: 20,
    category: '大模型',
    difficulty: 1,
    search: '机器',
    searchMode: 'keyword',  // keyword | pinyin | initial
    orderBy: 'viewCount',
    order: 'desc'
  }
}).then(res => {
  console.log(res.result);
  // { success: true, data: [...], pagination: {...} }
});
```

### 获取术语详情

```javascript
wx.cloud.callFunction({
  name: 'getTermDetail',
  data: {
    termId: 'term_001'
    // 或 termName: '机器学习'
  }
}).then(res => {
  console.log(res.result);
  // { success: true, data: {...}, relatedTerms: [...] }
});
```

### 更新浏览次数

```javascript
wx.cloud.callFunction({
  name: 'updateTermView',
  data: {
    termId: 'term_001',
    increment: 1
  }
}).then(res => {
  console.log(res.result);
  // { success: true, data: { termId: 'term_001', viewCount: 1521 } }
});
```

---

## 🔍 常见问题

### Q1: 云函数上传失败？

**A**: 检查以下几点：
1. 是否已开通云开发
2. package.json 中依赖是否正确
3. 网络连接是否正常

### Q2: 云函数调用超时？

**A**: 
1. 检查数据库查询是否有索引
2. 减少单次查询数据量
3. 考虑使用分页

### Q3: 数据库权限错误？

**A**: 
1. 检查集合权限设置
2. 确保用户已登录
3. 检查 openId 是否正确获取

---

## 📊 数据库索引建议

### terms 集合

```javascript
// 创建以下索引以优化查询性能
db.collection('terms').createIndex({ category: 1 });
db.collection('terms').createIndex({ difficulty: 1 });
db.collection('terms').createIndex({ firstLetter: 1 });
db.collection('terms').createIndex({ viewCount: -1 });
db.collection('terms').createIndex({ name: 'text', nameEn: 'text' });
```

### users 集合

```javascript
db.collection('users').createIndex({ openId: 1 });
db.collection('users').createIndex({ lastLoginAt: -1 });
```

---

## 📈 监控与日志

### 查看云函数日志

1. 云开发控制台 → 云函数
2. 选择对应云函数
3. 点击「日志」标签页

### 监控指标

- 调用次数
- 平均耗时
- 错误率
- 超时次数

---

**最后更新**: 2026-04-15  
**文档状态**: 完整 ✅
