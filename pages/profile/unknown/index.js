// pages/profile/unknown/index.js - 生词本页逻辑
Page({
  data: { unknownTerms: [] },

  onLoad: function () { this.loadUnknownTerms(); },
  onShow: function () { this.loadUnknownTerms(); },

  loadUnknownTerms() {
    try {
      const unknownIds = wx.getStorageSync('unknownTerms') || [];
      if (unknownIds.length === 0) {
        this.setData({ unknownTerms: [] });
        return;
      }
      const terms = require('../../../data/terms.json');
      const unknown = terms.filter(t => unknownIds.includes(t._id || t.id));
      this.setData({ unknownTerms: unknown });
    } catch (err) {
      console.error('加载生词失败:', err);
    }
  },

  markMastered(e) {
    const termId = e.currentTarget.dataset.id;
    try {
      let unknownIds = wx.getStorageSync('unknownTerms') || [];
      unknownIds = unknownIds.filter(id => id !== termId);
      wx.setStorageSync('unknownTerms', unknownIds);
      this.loadUnknownTerms();
      wx.showToast({ title: '已标记为掌握', icon: 'success' });
    } catch (err) {
      console.error('标记失败:', err);
    }
  },

  goToDetail(e) {
    wx.navigateTo({ url: `/pages/dictionary/detail/index?id=${e.currentTarget.dataset.id}` });
  }
});
