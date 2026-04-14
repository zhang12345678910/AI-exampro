// pages/detail/detail.js
const db = wx.cloud.database()

Page({
  data: {
    term: null,
    loading: true,
    isCollected: false,
    isLearned: false
  },

  onLoad: function (options) {
    if (options.id) {
      this.loadTerm(options.id)
    }
  },

  // 加载术语详情
  async loadTerm(termId) {
    try {
      const res = await db.collection('terms').doc(termId).get()
      this.setData({
        term: res.data,
        loading: false
      })
      
      // 检查收藏状态
      this.checkCollectionStatus(termId)
    } catch (err) {
      console.error('加载详情失败:', err)
      // 本地降级
      const localTerms = require('../../data/terms.json')
      const term = localTerms.find(t => t.id === termId)
      if (term) {
        this.setData({ term, loading: false })
      }
    }
  },

  // 检查收藏状态
  async checkCollectionStatus(termId) {
    try {
      const user = await wx.cloud.callFunction({
        name: 'getUserInfo'
      })
      const collected = user.result?.collectedTerms?.includes(termId)
      const learned = user.result?.learnedTerms?.includes(termId)
      this.setData({ isCollected: collected, isLearned: learned })
    } catch (err) {
      console.error('检查状态失败:', err)
    }
  },

  // 收藏/取消收藏
  async toggleCollect() {
    const termId = this.data.term.id
    const newStatus = !this.data.isCollected
    
    try {
      await wx.cloud.callFunction({
        name: 'toggleCollect',
        data: { termId, collect: newStatus }
      })
      this.setData({ isCollected: newStatus })
      wx.showToast({ 
        title: newStatus ? '已收藏' : '已取消', 
        icon: 'success' 
      })
    } catch (err) {
      console.error('收藏失败:', err)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  // 标记已学
  async markLearned() {
    const termId = this.data.term.id
    
    try {
      await wx.cloud.callFunction({
        name: 'updateProgress',
        data: { action: 'markLearned', termId }
      })
      this.setData({ isLearned: true })
      wx.showToast({ title: '已标记为已学', icon: 'success' })
    } catch (err) {
      console.error('标记失败:', err)
    }
  },

  // 分享
  onShareAppMessage: function () {
    const term = this.data.term
    return {
      title: `【AI 术语学习】${term.name} - ${term.definition.substring(0, 30)}...`,
      path: `/pages/detail/detail?id=${term.id}`,
      imageUrl: ''
    }
  },

  // 分享术语卡片到朋友圈
  shareToMoments() {
    // 小程序不支持直接分享到朋友圈，引导用户截图或使用官方分享
    wx.showModal({
      title: '分享提示',
      content: '点击右上角「…」，选择「发送给朋友」或「分享到朋友圈」',
      showCancel: false
    })
  }
})
