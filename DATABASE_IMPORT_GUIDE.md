# 📊 数据库导入指南 (JSON Lines 格式)

**更新日期**: 2026-04-15  
**格式**: JSON Lines (每行一个 JSON 对象)

---

## ✅ 已转换的文件

所有数据文件已转换为微信云开发支持的 **JSON Lines 格式**：

| 集合名 | 转换后的文件 | 数据量 | 文件大小 |
|--------|-------------|--------|----------|
| **terms** | `data/terms_extended_lines.json` | 50 条 | ~35KB |
| **categories** | `data/categories_lines.json` | 7 条 | ~2KB |
| **badges** | `data/badges_lines.json` | 8 条 | ~1.5KB |
| **quiz_questions** | `data/quiz_questions_lines.json` | 10 条 | ~4KB |

---

## 📝 导入步骤

### 步骤 1: 打开云开发控制台

1. 在**微信开发者工具**中
2. 点击顶部工具栏的**「云开发」**按钮
3. 进入云开发控制台

### 步骤 2: 创建数据库集合

点击左侧**「数据库」**→**「+」**创建以下集合：

```
✅ terms           (术语库)
✅ categories      (分类配置)
✅ badges          (勋章配置)
✅ quiz_questions  (测验题目)
```

### 步骤 3: 导入数据

#### 3.1 导入 terms 集合

1. 点击 `terms` 集合
2. 点击**「导入」**按钮
3. 选择**「文件导入」**
4. **选择文件**: 
   ```
   /home/admin/.openclaw/workspace/projects/ai-terms-miniprogram/data/terms_extended_lines.json
   ```
5. 点击**「导入」**
6. 等待导入完成 (约 30 秒)

**预期结果**: 导入 50 条数据

---

#### 3.2 导入 categories 集合

1. 点击 `categories` 集合
2. 点击**「导入」**
3. **选择文件**: 
   ```
   /home/admin/.openclaw/workspace/projects/ai-terms-miniprogram/data/categories_lines.json
   ```
4. 点击**「导入」**

**预期结果**: 导入 7 条数据

---

#### 3.3 导入 badges 集合

1. 点击 `badges` 集合
2. 点击**「导入」**
3. **选择文件**: 
   ```
   /home/admin/.openclaw/workspace/projects/ai-terms-miniprogram/data/badges_lines.json
   ```
4. 点击**「导入」**

**预期结果**: 导入 8 条数据

---

#### 3.4 导入 quiz_questions 集合

1. 点击 `quiz_questions` 集合
2. 点击**「导入」**
3. **选择文件**: 
   ```
   /home/admin/.openclaw/workspace/projects/ai-terms-miniprogram/data/quiz_questions_lines.json
   ```
4. 点击**「导入」**

**预期结果**: 导入 10 条数据

---

## ⚙️ 权限设置

导入完成后，设置每个集合的权限：

| 集合 | 权限 | 设置方法 |
|------|------|----------|
| terms | **所有用户可读** | 集合 → 权限 → 选择"所有用户可读" → 保存 |
| categories | **所有用户可读** | 同上 |
| badges | **所有用户可读** | 同上 |
| quiz_questions | **所有用户可读** | 同上 |

---

## ✅ 验证导入结果

### 检查数据量

导入完成后，在集合详情页查看数据量：

| 集合 | 预期数量 | 检查方法 |
|------|---------|----------|
| terms | 50 条 | 集合详情页顶部显示 |
| categories | 7 条 | 同上 |
| badges | 8 条 | 同上 |
| quiz_questions | 10 条 | 同上 |

### 测试查询

在云开发控制台的**「数据管理」**中测试查询：

```javascript
// 查询 terms 数量
db.collection('terms').count()
// 应该返回 50

// 查询分类列表
db.collection('categories').orderBy('order', 'asc').get()
// 应该返回 7 个分类

// 查询勋章列表
db.collection('badges').get()
// 应该返回 8 个勋章
```

---

## 📁 文件位置

转换后的文件都在这个目录：

```
/home/admin/.openclaw/workspace/projects/ai-terms-miniprogram/data/

├── terms_extended_lines.json      (50 个术语) ⭐ 使用这个
├── categories_lines.json          (7 个分类) ⭐ 使用这个
├── badges_lines.json              (8 个勋章) ⭐ 使用这个
└── quiz_questions_lines.json      (10 道题目) ⭐ 使用这个
```

---

## ❓ 常见问题

### Q1: 导入进度卡住？

**解决方案**:
- 等待 1-2 分钟
- 刷新页面重新导入
- 分批导入 (每次不超过 500 条)

### Q2: 导入后看不到数据？

**解决方案**:
1. 刷新浏览器页面
2. 检查集合是否选择正确
3. 确认导入成功提示

### Q3: 权限设置不生效？

**解决方案**:
1. 重新保存权限设置
2. 等待 1-2 分钟生效
3. 重新编译小程序

---

## 🎯 导入检查清单

- [ ] 创建 4 个数据库集合
- [ ] 导入 terms 集合 (50 条)
- [ ] 导入 categories 集合 (7 条)
- [ ] 导入 badges 集合 (8 条)
- [ ] 导入 quiz_questions 集合 (10 条)
- [ ] 设置所有集合为"所有用户可读"
- [ ] 验证数据量正确

---

## 📝 原始文件 vs 转换后文件

| 原始文件 (JSON 数组) | 转换后文件 (JSON Lines) | 用途 |
|---------------------|------------------------|------|
| terms_extended.json | terms_extended_lines.json | ⭐ 导入用这个 |
| categories.json | categories_lines.json | ⭐ 导入用这个 |
| badges.json | badges_lines.json | ⭐ 导入用这个 |
| quiz_questions.json | quiz_questions_lines.json | ⭐ 导入用这个 |

**注意**: 导入数据库时请使用 **_lines.json** 结尾的文件！

---

**下一步**: 按照上述步骤导入 4 个集合，完成后继续配置云函数！
