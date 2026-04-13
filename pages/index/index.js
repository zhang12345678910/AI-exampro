// pages/index/index.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    terms: [],
    loading: true,
    refreshing: false,
    category: 'all',
    categories: ['全部', '基础概念', '热门概念', '技术领域', '学习方法', '模型架构']
  },

  onLoad: function () {
    this.loadTerms()
  },

  onShow: function () {
    // 每次显示页面时刷新数据
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.setData({ refreshing: true })
    this.loadTerms().then(() => {
      this.setData({ refreshing: false })
      wx.stopPullDownRefresh()
    })
  },

  // 加载术语列表
  async loadTerms() {
    try {
      const res = await db.collection('terms')
        .orderBy('difficulty', 'asc')
        .limit(20)
        .get()

      this.setData({
        terms: res.data,
        loading: false
      })
    } catch (err) {
      console.error('加载术语失败:', err)
      // 本地降级：使用本地数据
      const localTerms = require('../../data/terms.json')
      this.setData({
        terms: localTerms.slice(0, 20),
        loading: false
      })
    }
  },

  // 切换分类
  onCategoryChange: function (e) {
    const category = e.currentTarget.dataset.category
    this.setData({ category })
    
    if (category === 'all') {
      this.loadTerms()
    } else {
      this.filterByCategory(category)
    }
  },

  // 按分类筛选
  async filterByCategory(category) {
    try {
      const res = await db.collection('terms')
        .where({ category })
        .limit(20)
        .get()

      this.setData({ terms: res.data })
    } catch (err) {
      console.error('筛选失败:', err)
    }
  },

  // 点击术语卡片
  onTermTap: function (e) {
    const termId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${termId}`
    })
  },

  // 标记已学
  async markLearned(e) {
    const termId = e.currentTarget.dataset.id
    try {
      await wx.cloud.callFunction({
        name: 'updateProgress',
        data: { action: 'markLearned', termId }
      })
      wx.showToast({ title: '已标记', icon: 'success' })
    } catch (err) {
      console.error('标记失败:', err)
    }
  }
})
