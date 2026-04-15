// pages/profile/settings/index.js - 设置页逻辑
Page({
  data: {
    darkMode: false,
    eyeProtection: false,
    dailyPush: true,
    reviewPush: true,
    cacheSize: '2.5MB'
  },

  onLoad: function () { this.loadSettings(); },

  loadSettings() {
    try {
      this.setData({
        darkMode: wx.getStorageSync('darkMode') || false,
        eyeProtection: wx.getStorageSync('eyeProtection') || false,
        dailyPush: wx.getStorageSync('dailyPush') !== false,
        reviewPush: wx.getStorageSync('reviewPush') !== false
      });
    } catch (err) { console.error('加载设置失败:', err); }
  },

  toggleDarkMode(e) { wx.setStorageSync('darkMode', e.detail.value); },
  toggleEyeProtection(e) { wx.setStorageSync('eyeProtection', e.detail.value); },
  toggleDailyPush(e) { wx.setStorageSync('dailyPush', e.detail.value); },
  toggleReviewPush(e) { wx.setStorageSync('reviewPush', e.detail.value); },

  clearCache() {
    wx.showModal({
      title: '清除缓存', content: '确定要清除缓存吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.showToast({ title: '已清除', icon: 'success' });
          this.setData({ cacheSize: '0KB' });
        }
      }
    });
  },

  exportData() { wx.showToast({ title: '功能开发中', icon: 'none' }); },
  checkUpdate() { wx.showToast({ title: '已是最新版本', icon: 'none' }); },
  showAbout() { wx.showToast({ title: '功能开发中', icon: 'none' }); },

  clearAllData() {
    wx.showModal({
      title: '清除所有数据', content: '确定要清除所有数据吗？此操作不可恢复！',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.showToast({ title: '已清除', icon: 'success' });
          setTimeout(() => wx.reLaunch({ url: '/pages/index/index' }), 1500);
        }
      }
    });
  }
});
