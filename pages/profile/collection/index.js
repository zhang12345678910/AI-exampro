// pages/profile/collection/index.js - 收藏夹页逻辑
Page({
  data: {
    collectedTerms: [],
    filteredTerms: [],
    searchValue: ''
  },

  onLoad: function () {
    this.loadCollectedTerms();
  },

  onShow: function () {
    this.loadCollectedTerms();
  },

  // 加载收藏列表
  loadCollectedTerms() {
    try {
      const collectedIds = wx.getStorageSync('collectedTerms') || [];
      
      if (collectedIds.length === 0) {
        this.setData({ collectedTerms: [], filteredTerms: [] });
        return;
      }
      
      // 从本地数据加载
      const terms = require('../../../data/terms.json');
      const collected = terms.filter(t => collectedIds.includes(t._id || t.id));
      
      this.setData({
        collectedTerms: collected,
        filteredTerms: collected
      });
    } catch (err) {
      console.error('加载收藏失败:', err);
    }
  },

  // 搜索输入
  onSearchInput(e) {
    const value = e.detail.value;
    this.setData({ searchValue: value });
    
    if (value) {
      const filtered = this.data.collectedTerms.filter(term => 
        term.name.includes(value) || 
        (term.nameEn && term.nameEn.toLowerCase().includes(value.toLowerCase()))
      );
      this.setData({ filteredTerms: filtered });
    } else {
      this.setData({ filteredTerms: this.data.collectedTerms });
    }
  },

  // 清除搜索
  clearSearch() {
    this.setData({ searchValue: '', filteredTerms: this.data.collectedTerms });
  },

  // 移除收藏
  removeCollection(e) {
    const termId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '移除收藏',
      content: '确定要移除这个术语吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            let collectedIds = wx.getStorageSync('collectedTerms') || [];
            collectedIds = collectedIds.filter(id => id !== termId);
            wx.setStorageSync('collectedTerms', collectedIds);
            
            this.loadCollectedTerms();
            wx.showToast({ title: '已移除', icon: 'success' });
          } catch (err) {
            console.error('移除收藏失败:', err);
          }
        }
      }
    });
  },

  // 跳转详情
  goToDetail(e) {
    const termId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/dictionary/detail/index?id=${termId}`
    });
  },

  // 跳转词典
  goToDictionary() {
    wx.switchTab({
      url: '/pages/dictionary/list/index'
    });
  }
});
