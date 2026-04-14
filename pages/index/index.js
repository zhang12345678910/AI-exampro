// pages/index/index.js
const app = getApp();

Page({
  data: {
    // 搜索相关
    searchValue: '',
    searchHistory: [],
    searchSuggestions: [],
    showSuggestions: false,
    
    // 每日一词
    dailyWord: null,
    isCheckInToday: false,
    
    // 分类入口
    categories: [
      { id: 'cat_001', name: '入门必备', icon: '🌱', desc: 'AI 基础概念' },
      { id: 'cat_002', name: '进阶提升', icon: '🚀', desc: '核心概念' },
      { id: 'cat_003', name: '专业术语', icon: '🎯', desc: '技术术语' },
      { id: 'cat_004', name: '热点新词', icon: '🔥', desc: '前沿概念' },
      { id: 'cat_005', name: '大模型', icon: '🤖', desc: 'LLM 相关' },
      { id: 'cat_006', name: 'AIGC', icon: '🎨', desc: '生成式 AI' }
    ],
    
    // 热门名词
    hotTerms: []
  },

  onLoad: function () {
    this.loadDailyWord();
    this.loadSearchHistory();
    this.loadHotTerms();
  },

  onShow: function () {
    this.checkTodayCheckIn();
  },

  onPullDownRefresh: function () {
    this.loadDailyWord();
    this.loadHotTerms();
    wx.stopPullDownRefresh();
  },

  // 加载每日一词
  async loadDailyWord() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await wx.cloud.callFunction({
        name: 'getDailyWord',
        data: { date: today }
      });
      
      if (res.result && res.result.success) {
        this.setData({ dailyWord: res.result.term });
      }
    } catch (error) {
      console.error('加载每日一词失败:', error);
      // 降级：从本地数据获取
      this.loadDailyWordFromLocal();
    }
  },

  loadDailyWordFromLocal() {
    const terms = require('../../data/terms.json');
    const today = new Date().getDate();
    const termIndex = today % terms.length;
    this.setData({ dailyWord: terms[termIndex] });
  },

  // 检查今日是否已打卡
  async checkTodayCheckIn() {
    try {
      const user = app.globalData.userInfo;
      if (!user) return;
      
      const today = new Date().toISOString().split('T')[0];
      const checkInCalendar = user.checkInCalendar || {};
      
      this.setData({ isCheckInToday: !!checkInCalendar[today] });
    } catch (error) {
      console.error('检查打卡状态失败:', error);
    }
  },

  // 加载搜索历史
  loadSearchHistory() {
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({ searchHistory: history.slice(0, 10) });
  },

  // 加载热门名词
  async loadHotTerms() {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('terms')
        .orderBy('viewCount', 'desc')
        .limit(10)
        .get();
      
      this.setData({ hotTerms: res.data });
    } catch (error) {
      console.error('加载热门名词失败:', error);
      // 降级：从本地数据获取
      const terms = require('../../data/terms.json');
      this.setData({ hotTerms: terms.slice(0, 10) });
    }
  },

  // 搜索框输入事件
  onSearchInput: function (e) {
    const value = e.detail.value;
    this.setData({ searchValue: value });
    
    if (value.length >= 1) {
      this.loadSuggestions(value);
    } else {
      this.setData({ searchSuggestions: [], showSuggestions: false });
    }
  },

  // 加载搜索建议
  async loadSuggestions(keyword) {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('terms')
        .where({
          name: db.RegExp({
            regexp: `^${keyword}`,
            options: 'i'
          })
        })
        .limit(5)
        .get();
      
      this.setData({ 
        searchSuggestions: res.data,
        showSuggestions: true
      });
    } catch (error) {
      console.error('加载搜索建议失败:', error);
    }
  },

  // 点击搜索框
  onSearchFocus: function () {
    this.setData({ showSuggestions: true });
  },

  // 搜索框失去焦点
  onSearchBlur: function () {
    setTimeout(() => {
      this.setData({ showSuggestions: false });
    }, 200);
  },

  // 执行搜索
  onSearch: function () {
    const keyword = this.data.searchValue.trim();
    if (!keyword) return;
    
    // 添加到搜索历史
    this.addToSearchHistory(keyword);
    
    // 跳转到词典页
    wx.navigateTo({
      url: `/pages/dictionary/list?keyword=${encodeURIComponent(keyword)}`
    });
  },

  // 添加到搜索历史
  addToSearchHistory: function (keyword) {
    let history = this.data.searchHistory;
    
    // 移除已存在的
    history = history.filter(item => item !== keyword);
    
    // 添加到开头
    history.unshift(keyword);
    
    // 限制最多 10 条
    if (history.length > 10) {
      history = history.slice(0, 10);
    }
    
    this.setData({ searchHistory: history });
    wx.setStorageSync('searchHistory', history);
  },

  // 清空搜索历史
  clearSearchHistory: function () {
    wx.showModal({
      title: '提示',
      content: '确定清空搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ searchHistory: [] });
          wx.removeStorageSync('searchHistory');
        }
      }
    });
  },

  // 删除单条搜索历史
  deleteSearchItem: function (e) {
    const index = e.currentTarget.dataset.index;
    let history = this.data.searchHistory;
    history.splice(index, 1);
    this.setData({ searchHistory: history });
    wx.setStorageSync('searchHistory', history);
  },

  // 点击搜索建议
  onSuggestionTap: function (e) {
    const termId = e.currentTarget.dataset.id;
    const termName = e.currentTarget.dataset.name;
    
    this.addToSearchHistory(termName);
    wx.navigateTo({
      url: `/pages/dictionary/detail?id=${termId}`
    });
  },

  // 点击每日一词卡片
  onDailyWordTap: function () {
    if (this.data.dailyWord && this.data.dailyWord._id) {
      wx.navigateTo({
        url: `/pages/dictionary/detail?id=${this.data.dailyWord._id}`
      });
    }
  },

  // 打卡
  onCheckIn: async function () {
    if (this.data.isCheckInToday) {
      wx.showToast({ title: '今日已打卡', icon: 'none' });
      return;
    }
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'checkIn',
        data: { date: new Date().toISOString().split('T')[0] }
      });
      
      if (res.result && res.result.success) {
        this.setData({ isCheckInToday: true });
        
        wx.showModal({
          title: '打卡成功',
          content: `连续打卡 ${res.result.continuousDays} 天`,
          showCancel: false,
          confirmText: '分享'
        });
      }
    } catch (error) {
      console.error('打卡失败:', error);
      wx.showToast({ title: '打卡失败，请重试', icon: 'none' });
    }
  },

  // 收藏每日一词
  onCollectDailyWord: async function () {
    if (!this.data.dailyWord || !this.data.dailyWord._id) return;
    
    try {
      await app.toggleCollect(this.data.dailyWord._id);
      wx.showToast({ title: '收藏成功', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: '收藏失败', icon: 'none' });
    }
  },

  // 分享每日一词
  onShareDailyWord: function () {
    if (!this.data.dailyWord) return;
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 点击分类入口
  onCategoryTap: function (e) {
    const categoryId = e.currentTarget.dataset.id;
    const categoryName = e.currentTarget.dataset.name;
    
    wx.navigateTo({
      url: `/pages/dictionary/list?category=${categoryId}&categoryName=${encodeURIComponent(categoryName)}`
    });
  },

  // 点击热门名词
  onHotTermTap: function (e) {
    const termId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/dictionary/detail?id=${termId}`
    });
  },

  // 分享
  onShareAppMessage: function () {
    return {
      title: 'AI 词星球 - 每日一词',
      path: '/pages/index/index',
      imageUrl: ''
    };
  }
});
