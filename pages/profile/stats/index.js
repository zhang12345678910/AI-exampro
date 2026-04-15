// pages/profile/stats/index.js - 学习记录页逻辑
const app = getApp();

Page({
  data: {
    stats: { totalLearnedDays: 0, learnedTermsCount: 0, continuousCheckInDays: 0, quizAvgScore: 0 },
    quizScores: [],
    recentViews: []
  },

  onLoad: function () { this.loadStats(); },
  onShow: function () { this.loadStats(); },

  loadStats() {
    try {
      const user = app.globalData.userInfo;
      if (user && user.openId) {
        wx.cloud.callFunction({
          name: 'getTermList',
          data: { page: 1, pageSize: 1 }
        }).then(res => {
          const checkInCalendar = wx.getStorageSync('checkInCalendar') || {};
          let continuousDays = 0;
          const dates = Object.keys(checkInCalendar).sort().reverse();
          for (let i = 0; i < dates.length; i++) {
            if (checkInCalendar[dates[i]]) continuousDays++;
            else break;
          }
          
          this.setData({
            stats: {
              totalLearnedDays: user.stats?.totalLearnedDays || 0,
              learnedTermsCount: user.stats?.learnedTermsCount || 0,
              continuousCheckInDays: continuousDays,
              quizAvgScore: user.stats?.quizAvgScore || 0
            },
            quizScores: (user.quizScores || []).slice(-10),
            recentViews: (wx.getStorageSync('recentViews') || []).slice(0, 10)
          });
        });
      }
    } catch (err) { console.error('加载统计失败:', err); }
  }
});
