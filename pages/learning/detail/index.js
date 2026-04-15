// pages/learning/detail/index.js - 学习详情页 (临时占位)
Page({
  data: {
    level: 0,
    terms: []
  },

  onLoad: function (options) {
    const level = parseInt(options.level) || 0;
    this.setData({ level });
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  onShareAppMessage: function () {
    return {
      title: 'AI 词星球 - 分级学习',
      path: '/pages/learning/detail/index'
    };
  }
});
