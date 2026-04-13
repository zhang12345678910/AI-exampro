// pages/collection/collection.js
const db = wx.cloud.database()

Page({
  data: {
    collectedTerms: [],
    loading: true,
    tabs: ['收藏', '已学'],
    currentTab: 0
  },

  onLoad: function () {
    this.loadData()
  },

  onShow: function () {
    // 每次显示时刷新数据
    this.loadData()
  },

  // 加载数据
  async loadData() {
    this.setData({ loading: true })
    
    try {
      // 获取用户收藏和已学列表
      const userRes = await wx.cloud.callFunction({ name: 'getUserInfo' })
      const userData = userRes.result
      
      const collectedIds = userData?.collectedTerms || []
      const learnedIds = userData?.learnedTerms || []
      
      // 根据当前 tab 加载数据
      const ids = this.data.currentTab === 0 ? collectedIds : learnedIds
      
      if (ids.length > 0) {
        const termsRes = await db.collection('terms')
          .where({
            _id: _.in(ids)
          })
          .get()
        
        this.setData({ 
          [this.data.currentTab === 0 ? 'collectedTerms' : 'learnedTerms']: termsRes.data 
        })
      } else {
        this.setData({ 
          [this.data.currentTab === 0 ? 'collectedTerms' : 'learnedTerms']: [] 
        })
      }
    } catch (err) {
      console.error('加载失败:', err)
      // 本地降级
      this.setData({ collectedTerms: [], learnedTerms: [] })
    }
    
    this.setData({ loading: false })
  },

  // 切换 tab
  onTabChange(e) {
    const index = e.currentTarget.dataset.index
    this.setData({ currentTab: index })
    this.loadData()
  },

  // 点击术语
  onTermTap(e) {
    const termId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${termId}`
    })
  },

  // 取消收藏
  async uncollect(e) {
    const termId = e.currentTarget.dataset.id
    
    try {
      await wx.cloud.callFunction({
        name: 'toggleCollect',
        data: { termId, collect: false }
      })
      
      // 从列表移除
      const collectedTerms = this.data.collectedTerms.filter(t => t.id !== termId)
      this.setData({ collectedTerms })
      
      wx.showToast({ title: '已取消收藏', icon: 'success' })
    } catch (err) {
      console.error('取消收藏失败:', err)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  // 从已学移除
  async unlearn(e) {
    const termId = e.currentTarget.dataset.id
    
    try {
      await wx.cloud.callFunction({
        name: 'updateProgress',
        data: { action: 'unmarkLearned', termId }
      })
      
      const learnedTerms = this.data.learnedTerms.filter(t => t.id !== termId)
      this.setData({ learnedTerms })
      
      wx.showToast({ title: '已移除', icon: 'success' })
    } catch (err) {
      console.error('移除失败:', err)
    }
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: '我在 AI 术语通学习，一起来挑战！',
      path: '/pages/index/index'
    }
  }
})
