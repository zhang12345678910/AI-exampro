// pages/profile/badges/index.js - 勋章墙页逻辑
const app = getApp();
const format = require('../../../utils/format.js');

Page({
  data: { badges: [], unlockedCount: 0 },

  onLoad: function () { this.loadBadges(); },
  onShow: function () { this.loadBadges(); },

  loadBadges() {
    try {
      const user = app.globalData.userInfo;
      const badges = require('../../../data/badges.json');
      const userBadges = user?.badges || [];
      
      const badgesWithStatus = badges.map(badge => {
        const userBadge = userBadges.find(b => b.badgeId === badge.badgeId);
        return {
          ...badge,
          unlocked: !!userBadge,
          unlockedAt: userBadge?.unlockedAt
        };
      });
      
      this.setData({
        badges: badgesWithStatus,
        unlockedCount: badgesWithStatus.filter(b => b.unlocked).length
      });
    } catch (err) { console.error('加载勋章失败:', err); }
  },

  // 格式化日期
  formatDate: format.formatDate
});
