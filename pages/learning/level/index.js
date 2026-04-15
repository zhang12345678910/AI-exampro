// pages/learning/level/index.js - 分级学习页逻辑 (宇宙星空主题)
const app = getApp();

Page({
  data: {
    currentTab: 'learning',
    
    // 学习级别
    levelProgress: [
      { 
        name: '入门', 
        desc: '基础名词，如 AI、机器学习', 
        learned: 0, 
        total: 50, 
        percent: 0,
        locked: false 
      },
      { 
        name: '进阶', 
        desc: '核心概念，如大模型、提示词工程', 
        learned: 0, 
        total: 100, 
        percent: 0,
        locked: true 
      },
      { 
        name: '专业', 
        desc: '技术术语，如 Transformer、RAG', 
        learned: 0, 
        total: 200, 
        percent: 0,
        locked: true 
      }
    ],
    
    // 打卡
    continuousCheckInDays: 0,
    totalCheckInDays: 0,
    isCheckInToday: false
  },

  onLoad: function () {
    this.loadLearningProgress();
    this.loadCheckInStatus();
  },

  onShow: function () {
    this.checkTodayCheckIn();
  },

  // 加载学习进度
  async loadLearningProgress() {
    try {
      // 从云数据库加载用户学习进度
      const user = app.globalData.userInfo;
      
      if (user && user.openId) {
        const db = wx.cloud.database();
        const userRes = await db.collection('users').doc(user.openId).get();
        
        if (userRes.data) {
          const learnedTerms = userRes.data.learnedTerms || [];
          
          // 计算各级别进度
          const levelProgress = this.data.levelProgress.map((level, index) => {
            const learned = this.countLearnedTerms(learnedTerms, index);
            const percent = Math.round((learned / level.total) * 100);
            const locked = index > 0 && this.data.levelProgress[index - 1].learned < this.data.levelProgress[index - 1].total * 0.5;
            
            return {
              ...level,
              learned,
              percent,
              locked
            };
          });
          
          this.setData({ levelProgress });
        }
      }
    } catch (err) {
      console.error('加载学习进度失败:', err);
    }
  },

  // 计算已学数量
  countLearnedTerms(learnedTerms, levelIndex) {
    // 简化实现，实际需要根据术语难度分类
    return Math.min(learnedTerms.length, this.data.levelProgress[levelIndex].total);
  },

  // 加载打卡状态
  loadCheckInStatus() {
    try {
      const user = app.globalData.userInfo;
      
      if (user && user.openId) {
        const checkInCalendar = wx.getStorageSync('checkInCalendar') || {};
        const today = new Date().toISOString().split('T')[0];
        
        // 计算连续打卡天数
        let continuousDays = 0;
        let totalDays = 0;
        
        for (const date in checkInCalendar) {
          if (checkInCalendar[date]) {
            totalDays++;
          }
        }
        
        // 计算连续打卡
        const dates = Object.keys(checkInCalendar).sort().reverse();
        for (let i = 0; i < dates.length; i++) {
          if (checkInCalendar[dates[i]]) {
            continuousDays++;
          } else {
            break;
          }
        }
        
        this.setData({
          continuousCheckInDays: continuousDays,
          totalCheckInDays: totalDays,
          isCheckInToday: !!checkInCalendar[today]
        });
      }
    } catch (err) {
      console.error('加载打卡状态失败:', err);
    }
  },

  // 检查今日打卡
  checkTodayCheckIn() {
    const checkInCalendar = wx.getStorageSync('checkInCalendar') || {};
    const today = new Date().toISOString().split('T')[0];
    this.setData({ isCheckInToday: !!checkInCalendar[today] });
  },

  // 选择级别
  selectLevel(e) {
    const levelIndex = e.currentTarget.dataset.level;
    const level = this.data.levelProgress[levelIndex];
    
    if (level.locked) {
      wx.showToast({ title: '请先完成前置等级', icon: 'none' });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/learning/detail/index?level=${levelIndex}`
    });
  },

  // 打卡
  async doCheckIn() {
    if (this.data.isCheckInToday) {
      wx.showToast({ title: '今日已打卡', icon: 'none' });
      return;
    }
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'checkIn',
        data: {}
      });
      
      if (res.result && res.result.success) {
        const newContinuousDays = res.result.continuousDays;
        const newTotalDays = res.result.totalDays;
        
        this.setData({
          isCheckInToday: true,
          continuousCheckInDays: newContinuousDays,
          totalCheckInDays: newTotalDays
        });
        
        // 更新本地存储
        const checkInCalendar = wx.getStorageSync('checkInCalendar') || {};
        const today = new Date().toISOString().split('T')[0];
        checkInCalendar[today] = true;
        wx.setStorageSync('checkInCalendar', checkInCalendar);
        
        wx.showToast({ 
          title: res.result.message || '打卡成功', 
          icon: 'success',
          duration: 2000
        });
        
        // 显示新勋章
        if (res.result.newBadges && res.result.newBadges.length > 0) {
          setTimeout(() => {
            wx.showModal({
              title: '恭喜解锁新勋章',
              content: res.result.newBadges.map(b => b.name).join(', '),
              showCancel: false
            });
          }, 1000);
        }
      }
    } catch (err) {
      console.error('打卡失败:', err);
      wx.showToast({ title: '打卡失败', icon: 'none' });
    }
  },

  // 跳转打卡日历
  goToCheckInCalendar() {
    wx.navigateTo({
      url: '/pages/learning/checkin/index'
    });
  },

  // 开始测试
  startQuiz(e) {
    const level = e.currentTarget.dataset.level;
    const levelData = this.data.levelProgress[level];
    
    if (levelData.locked) {
      wx.showToast({ title: '请先完成前置等级', icon: 'none' });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/learning/quiz/index?level=${level}`
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
    return {
      title: 'AI 词星球 - 分级学习系统',
      path: '/pages/learning/level/index',
      withShareTicket: true
    };
  }
});
