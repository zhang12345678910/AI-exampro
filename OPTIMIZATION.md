# AI 词星球小程序 - 性能优化指南

**创建日期**: 2026-04-14  
**阶段**: Day 6 - 测试 + 优化

---

## ✅ 已完成的优化

### 1. 数据加载优化

#### 首页列表
- ✅ 限制首次加载 20 条数据
- ✅ 支持下拉刷新
- ✅ 本地降级方案（云数据库失败时使用本地数据）

```javascript
// pages/index/index.js
async loadTerms() {
  try {
    const res = await db.collection('terms')
      .orderBy('difficulty', 'asc')
      .limit(20)  // ← 限制数量
      .get()
    // ...
  } catch (err) {
    // 本地降级
    const localTerms = require('../../data/terms.json')
    this.setData({ terms: localTerms.slice(0, 20) })
  }
}
```

### 2. setData 优化

#### 使用数据路径更新
```javascript
// ✅ 推荐：只更新变化的数据
this.setData({
  'list[0].name': '新名称',
  'userInfo.score': newScore
})

// ❌ 避免：全量更新
this.setData({ list: newList })
```

#### 批量更新
```javascript
// ✅ 推荐：合并多次 setData
this.setData({
  field1: value1,
  field2: value2,
  field3: value3
})

// ❌ 避免：多次单独调用
this.setData({ field1: value1 })
this.setData({ field2: value2 })
this.setData({ field3: value3 })
```

### 3. 图片优化

#### TabBar 图标
- ✅ 尺寸：81x81 像素（符合要求）
- ✅ 格式：PNG
- ✅ 大小：1.5KB - 3.5KB（已压缩）

#### 优化建议
- 使用在线工具压缩图片（tinypng.com）
- 避免使用 base64 格式图片
- 大图使用 CDN

### 4. 云函数优化

#### 减少调用次数
```javascript
// ✅ 推荐：批量操作
await db.collection('users').doc(openId).update({
  data: {
    learnedTerms: _.addToSet(termId),
    lastLearnedAt: db.serverDate()
  }
})

// ❌ 避免：多次调用
await db.collection('users').doc(openId).update({ data: { learnedTerms: _.addToSet(termId) } })
await db.collection('users').doc(openId).update({ data: { lastLearnedAt: db.serverDate() } })
```

#### 云函数复用
- ✅ `getUserInfo` 被多个页面复用
- ✅ `updateProgress` 统一处理进度更新

### 5. iOS 兼容性

#### 日期格式处理
```javascript
// ✅ 正确：兼容 iOS
new Date('2026/04/14')
new Date('2026-04-14'.replace(/-/g, '/'))

// ❌ 错误：iOS Safari 不支持
new Date('2026-04-14')
```

#### utils/date.js
```javascript
/**
 * 安全解析日期字符串（iOS 兼容）
 */
export function parseDate(dateStr) {
  return new Date(dateStr.replace(/-/g, '/'))
}

/**
 * 格式化日期为 YYYY/MM/DD
 */
export function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
}
```

---

## 📊 性能指标

| 指标 | 目标值 | 当前值 | 状态 |
|------|--------|--------|------|
| 首页加载时间 | < 2 秒 | - | ⏳ 待测试 |
| 详情页加载 | < 1 秒 | - | ⏳ 待测试 |
| 测验题目加载 | < 2 秒 | - | ⏳ 待测试 |
| TabBar 图标大小 | < 50KB | 1.5-3.5KB | ✅ |
| 代码包大小 | < 2MB | - | ⏳ 待检查 |

---

## 🔍 待测试项目

### 1. 真机性能测试

```bash
# 在微信开发者工具中
1. 点击「预览」→ 扫码真机测试
2. 打开「调试器」→ 查看 Performance
3. 记录各页面加载时间
```

### 2. 网络请求监控

```bash
# 检查云函数调用频率
1. 云开发控制台 → 云函数 → 调用日志
2. 查看单次使用调用次数
3. 优化频繁调用
```

### 3. 内存占用检查

```bash
# 在开发者工具中
1. 调试器 → Memory
2. 检查内存泄漏
3. 查看页面切换内存变化
```

---

## 🐛 已知问题

| 问题 | 影响 | 优先级 | 解决方案 |
|------|------|--------|----------|
| 订阅消息模板未配置 | 提醒功能不可用 | P1 | 在微信公众平台配置 |
| 无网络时体验 | 降级数据可能过期 | P2 | 添加缓存时间戳检查 |

---

## 📝 优化清单

### 代码层面
- [x] 数据分页加载
- [x] 本地降级方案
- [x] setData 优化
- [x] iOS 日期兼容
- [ ] 图片懒加载（后续）
- [ ] 虚拟列表（数据量大时）

### 用户体验
- [x] 加载状态提示
- [x] 空状态提示
- [x] 错误处理
- [x] 成功/失败反馈
- [ ] 骨架屏（后续）

### 性能监控
- [ ] 添加性能埋点
- [ ] 监控慢查询
- [ ] 统计云函数耗时

---

**最后更新**: 2026-04-14  
**测试人员**: AI Assistant
