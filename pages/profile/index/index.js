// pages/profile/index.js - 用户中心页逻辑 (宇宙星空主题)
const app = getApp();

Page({
  data: {
    currentTab: 'profile',
    
    // 用户信息
    userInfo: {
      nickName: 'AI 学习者',
      avatarUrl: '',
      level: 'AI 萌新',
      stats: {
        totalLearnedDays: 0,
        learnedTermsCount: 0,
        collectedTermsCount: 0,
        continuousCheckInDays: 0,
        totalCheckInDays: 0,
        quizTotalCount: 0,
        quizAvgScore: 0,
        unknownTermsCount: 0,
        notesCount: 0
      },
      badges: []
    },
    
    // 最近学习
    recentTerms: []
  },

  onLoad: function () {
    this.loadUserInfo();
    this.loadRecentTerms();
  },

  onShow: function () {
    this.loadUserInfo();
  },

  onPullDownRefresh: function () {
    this.loadUserInfo();
    this.loadRecentTerms();
    wx.stopPullDownRefresh();
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const user = app.globalData.userInfo;
      
      if (user && user.openId) {
        const db = wx.cloud.database();
        const userRes = await db.collection('users').doc(user.openId).get();
        
        if (userRes.data) {
          const userData = userRes.data;
          
          this.setData({
            userInfo: {
              nickName: userData.nickName || 'AI 学习者',
              avatarUrl: userData.avatarUrl || '',
              level: userData.level || 'AI 萌新',
              stats: userData.stats || {
                totalLearnedDays: 0,
                learnedTermsCount: 0,
                collectedTermsCount: 0,
                continuousCheckInDays: 0,
                totalCheckInDays: 0,
                quizTotalCount: 0,
                quizAvgScore: 0
              },
              badges: userData.badges || []
            }
          });
        }
      }
    } catch (err) {
      console.error('加载用户信息失败:', err);
      
      // 降级：使用本地数据
      this.loadLocalUserInfo();
    }
  },

  // 加载本地用户信息
  loadLocalUserInfo() {
    const collectedTerms = wx.getStorageSync('collectedTerms') || [];
    const checkInCalendar = wx.getStorageSync('checkInCalendar') || {};
    
    let totalCheckInDays = 0;
    for (const date in checkInCalendar) {
      if (checkInCalendar[date]) {
        totalCheckInDays++;
      }
    }
    
    this.setData({
      'userInfo.stats.collectedTermsCount': collectedTerms.length,
      'userInfo.stats.totalCheckInDays': totalCheckInDays
    });
  },

  // 加载最近学习
  loadRecentTerms() {
    try {
      const recentViews = wx.getStorageSync('recentViews') || [];
      this.setData({ recentTerms: recentViews.slice(0, 5) });
    } catch (err) {
      console.error('加载最近学习失败:', err);
    }
  },

  // 跳转收藏夹
  goToCollection() {
    wx.navigateTo({
      url: '/pages/profile/collection/index'
    });
  },

  // 跳转生词本
  goToUnknown() {
    wx.navigateTo({
      url: '/pages/profile/unknown/index'
    });
  },

  // 跳转笔记管理
  goToNotes() {
    wx.navigateTo({
      url: '/pages/profile/notes/index'
    });
  },

  // 跳转学习记录
  goToStats() {
    wx.navigateTo({
      url: '/pages/profile/stats/index'
    });
  },

  // 跳转勋章墙
  goToBadges() {
    wx.navigateTo({
      url: '/pages/profile/badges/index'
    });
  },

  // 跳转设置
  goToSettings() {
    wx.navigateTo({
      url: '/pages/profile/settings/index'
    });
  },

  // 跳转历史记录
  goToHistory() {
    wx.navigateTo({
      url: '/pages/profile/stats/index?tab=history'
    });
  },

  // 跳转详情
  goToDetail(e) {
    const termId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/dictionary/detail/index?id=${termId}`
    });
  },

  // 切换 Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    
    if (tab === this.data.currentTab) {
      return;
    }
    
    const pages = {
      home: '/pages/index/index',
      dictionary: '/pages/dictionary/list/index',
      learning: '/pages/learning/level/index',
      profile: '/pages/profile/index'
    };
    
    if (pages[tab]) {
      wx.switchTab({
        url: pages[tab]
      });
    }
  },

  // 页面分享
  onShareAppMessage() {
    const stats = this.data.userInfo.stats;
    return {
      title: `AI 词星球 - 已学习${stats.learnedTermsCount || 0}个术语`,
      path: '/pages/profile/index',
      imageUrl: '',
      withShareTicket: true
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    const stats = this.data.userInfo.stats;
    return {
      title: `我在 AI 词星球学习了${stats.learnedTermsCount || 0}个术语`,
      query: '',
      imageUrl: ''
    };
  }
});
