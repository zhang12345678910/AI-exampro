// pages/index/index.js - 首页逻辑 (宇宙星空主题)
const app = getApp();

Page({
  data: {
    // 当前 Tab
    currentTab: 'home',
    
    // 搜索相关
    searchValue: '',
    searchHistory: [],
    
    // 每日一词
    dailyWord: null,
    isCheckInToday: false,
    isCollected: false,
    
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
    hotTerms: [],
    
    // 加载状态
    loading: false,
    
    // 星星动画数据
    stars: []
  },

  onLoad: function () {
    this.generateStars();
    this.loadDailyWord();
    this.loadHotTerms();
    this.loadSearchHistory();
  },

  onReady: function () {
    // 页面渲染完成
  },

  onShow: function () {
    this.checkTodayCheckIn();
  },

  onPullDownRefresh: function () {
    this.loadDailyWord();
    this.loadHotTerms();
    wx.stopPullDownRefresh();
  },

  // 生成星星动画数据
  generateStars() {
    const stars = [];
    const count = 20; // 优化性能，减少到 20 个
    
    for (let i = 0; i < count; i++) {
      stars.push({
        top: Math.random() * 100,
        left: Math.random() * 100,
        delay: Math.random() * 3
      });
    }
    
    this.setData({ stars });
  },

  // 加载每日一词
  async loadDailyWord() {
    this.setData({ loading: true });
    
    try {
      // 云函数调用 (设置超时)
      const res = await wx.cloud.callFunction({
        name: 'getDailyWord',
        data: {},
        timeout: 5000 // 5 秒超时
      });
      
      if (res.result && res.result.success) {
        this.setData({
          dailyWord: res.result.data,
          loading: false
        });
      } else {
        throw new Error('云函数返回失败');
      }
    } catch (err) {
      console.warn('⚠️ 云函数调用失败，使用本地数据:', err.message);
      
      // 降级：使用本地数据
      try {
        const terms = require('../../data/terms.json');
        if (terms && terms.length > 0) {
          this.setData({
            dailyWord: terms[0],
            loading: false
          });
        }
      } catch (localErr) {
        this.setData({ loading: false });
      }
    }
  },

  // 加载热门名词
  async loadHotTerms() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getTermList',
        data: {
          page: 1,
          pageSize: 10,
          orderBy: 'viewCount',
          order: 'desc'
        }
      });
      
      if (res.result && res.result.success) {
        this.setData({ hotTerms: res.result.data });
      }
    } catch (err) {
      console.error('加载热门名词失败:', err);
      
      // 降级：使用本地数据
      try {
        const terms = require('../../data/terms.json');
        const sorted = terms.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        this.setData({ hotTerms: sorted.slice(0, 10) });
      } catch (localErr) {
        console.error('本地加载失败:', localErr);
      }
    }
  },

  // 加载搜索历史
  loadSearchHistory() {
    try {
      const history = wx.getStorageSync('searchHistory') || [];
      this.setData({ searchHistory: history.slice(0, 10) });
    } catch (err) {
      console.error('加载搜索历史失败:', err);
    }
  },

  // 检查今日打卡
  checkTodayCheckIn() {
    try {
      const checkInCalendar = wx.getStorageSync('checkInCalendar') || {};
      const today = new Date().toISOString().split('T')[0];
      this.setData({ isCheckInToday: !!checkInCalendar[today] });
    } catch (err) {
      console.error('检查打卡失败:', err);
    }
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchValue: e.detail.value });
  },

  // 搜索确认
  onSearchConfirm(e) {
    const value = e.detail.value.trim();
    if (value) {
      this.saveSearchHistory(value);
      wx.navigateTo({
        url: `/pages/dictionary/list/index?search=${encodeURIComponent(value)}`
      });
    }
  },

  // 清除搜索
  clearSearch() {
    this.setData({ searchValue: '' });
  },

  // 保存搜索历史
  saveSearchHistory(keyword) {
    try {
      let history = wx.getStorageSync('searchHistory') || [];
      
      // 移除已存在的
      history = history.filter(k => k !== keyword);
      
      // 添加到开头
      history.unshift(keyword);
      
      // 只保留最近 10 条
      history = history.slice(0, 10);
      
      wx.setStorageSync('searchHistory', history);
      this.setData({ searchHistory: history });
    } catch (err) {
      console.error('保存搜索历史失败:', err);
    }
  },

  // 选择分类
  selectCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/dictionary/list/index?category=${categoryId}`
    });
  },

  // 跳转详情
  goToDetail(e) {
    const termId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/dictionary/detail/index?id=${termId}`
    });
  },

  // 切换打卡
  async toggleCheckIn() {
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
        this.setData({ isCheckInToday: true });
        
        // 更新本地存储
        const checkInCalendar = wx.getStorageSync('checkInCalendar') || {};
        const today = new Date().toISOString().split('T')[0];
        checkInCalendar[today] = true;
        wx.setStorageSync('checkInCalendar', checkInCalendar);
        
        wx.showToast({ 
          title: res.result.message || '打卡成功', 
          icon: 'success' 
        });
      }
    } catch (err) {
      console.error('打卡失败:', err);
      wx.showToast({ title: '打卡失败', icon: 'none' });
    }
  },

  // 切换收藏
  async toggleCollection() {
    const termId = this.data.dailyWord._id;
    const isCollected = this.data.isCollected;
    
    try {
      let collectedTerms = wx.getStorageSync('collectedTerms') || [];
      
      if (isCollected) {
        // 取消收藏
        collectedTerms = collectedTerms.filter(id => id !== termId);
        wx.showToast({ title: '已取消收藏', icon: 'none' });
      } else {
        // 添加收藏
        collectedTerms.push(termId);
        wx.showToast({ title: '收藏成功', icon: 'success' });
      }
      
      this.setData({ isCollected: !isCollected });
      wx.setStorageSync('collectedTerms', collectedTerms);
    } catch (err) {
      console.error('切换收藏失败:', err);
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  // 分享每日一词
  shareDailyWord() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 切换 Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    
    if (tab === this.data.currentTab) {
      return;
    }
    
    this.setData({ currentTab: tab });
    
    // 跳转页面
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
    const term = this.data.dailyWord;
    return {
      title: term ? `AI 词星球 - 今日术语：${term.name}` : 'AI 词星球 - 探索 AI 知识宇宙',
      path: term ? `/pages/dictionary/detail/index?id=${term._id}` : '/pages/index/index',
      imageUrl: '',
      withShareTicket: true
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    const term = this.data.dailyWord;
    return {
      title: term ? `今日 AI 术语：${term.name}` : 'AI 词星球',
      query: term ? `id=${term._id}` : '',
      imageUrl: ''
    };
  }
});
