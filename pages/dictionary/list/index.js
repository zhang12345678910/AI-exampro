// pages/dictionary/list/index.js - 词典列表页逻辑 (宇宙星空主题)
const app = getApp();
const pinyin = require('../../../utils/pinyin.js');

Page({
  data: {
    // 当前 Tab
    currentTab: 'dictionary',
    
    // 搜索相关
    searchValue: '',
    searchMode: 'keyword', // keyword, pinyin, letter
    searchModes: [
      { id: 'keyword', name: '关键词' },
      { id: 'pinyin', name: '拼音' },
      { id: 'letter', name: '字母' }
    ],
    
    // 分类筛选
    categories: [],
    selectedCategory: null,
    
    // 术语列表
    termList: [],
    filteredList: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 20,
    
    // 选中术语详情
    selectedTerm: null,
    isCollected: false
  },

  onLoad: function (options) {
    this.loadCategories();
    this.loadTermList();
    
    // 处理搜索参数
    if (options.search) {
      this.setData({
        searchValue: decodeURIComponent(options.search)
      });
      this.searchTerms(decodeURIComponent(options.search));
    }
    
    // 处理分类参数
    if (options.category) {
      this.setData({ selectedCategory: options.category });
      this.loadTermList();
    }
  },

  onShow: function () {
    // 刷新列表
  },

  onPullDownRefresh: function () {
    this.loadTermList(true);
    wx.stopPullDownRefresh();
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreTerms();
    }
  },

  // 加载分类
  async loadCategories() {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('categories').orderBy('order', 'asc').get();
      
      if (res.data.length > 0) {
        this.setData({ categories: res.data });
      } else {
        // 默认分类
        this.setData({
          categories: [
            { _id: 'cat_001', name: '大模型', icon: '🤖' },
            { _id: 'cat_002', name: '深度学习', icon: '🧠' },
            { _id: 'cat_003', name: '基础概念', icon: '📚' },
            { _id: 'cat_004', name: 'AIGC', icon: '🎨' },
            { _id: 'cat_005', name: '机器学习', icon: '🤖' }
          ]
        });
      }
    } catch (err) {
      console.error('加载分类失败:', err);
    }
  },

  // 加载术语列表
  async loadTermList(refresh = false) {
    this.setData({ loading: true });
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'getTermList',
        data: {
          page: this.data.page,
          pageSize: this.data.pageSize,
          category: this.data.selectedCategory,
          orderBy: 'viewCount',
          order: 'desc'
        }
      });
      
      if (res.result && res.result.success) {
        const newList = refresh ? res.result.data : [...this.data.termList, ...res.result.data];
        
        this.setData({
          termList: newList,
          filteredList: newList,
          loading: false,
          hasMore: res.result.pagination.hasMore,
          page: this.data.page + 1
        });
      }
    } catch (err) {
      console.error('加载术语列表失败:', err);
      // 降级：使用本地数据
      this.loadLocalTerms(refresh);
    }
  },

  // 加载本地术语 (降级方案)
  loadLocalTerms(refresh = false) {
    try {
      const terms = require('../../data/terms.json');
      let filtered = terms;
      
      // 分类筛选
      if (this.data.selectedCategory) {
        filtered = terms.filter(t => t.category === this.data.selectedCategory);
      }
      
      const pageSize = this.data.pageSize;
      const page = this.data.page;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      
      const newList = refresh ? filtered.slice(start, end) : 
                                  [...this.data.termList, ...filtered.slice(start, end)];
      
      this.setData({
        termList: newList,
        filteredList: newList,
        loading: false,
        hasMore: end < filtered.length
      });
    } catch (err) {
      console.error('加载本地术语失败:', err);
      this.setData({ loading: false });
    }
  },

  // 加载更多
  loadMoreTerms() {
    this.loadTermList();
  },

  // 切换检索方式
  switchSearchMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ searchMode: mode });
    
    if (mode === 'letter') {
      this.showLetterIndex();
    }
  },

  // 显示字母索引
  showLetterIndex() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    wx.showActionSheet({
      itemList: letters,
      success: (res) => {
        const letter = letters[res.tapIndex];
        this.filterByLetter(letter);
      }
    });
  },

  // 按字母筛选
  filterByLetter(letter) {
    this.setData({ selectedLetter: letter });
    
    const filtered = this.data.termList.filter(term => {
      const firstLetter = term.firstLetter || (term.nameEn ? term.nameEn.charAt(0).toUpperCase() : '');
      return firstLetter === letter;
    });
    
    this.setData({ filteredList: filtered });
  },

  // 选择分类
  selectCategory(e) {
    const categoryId = e.currentTarget.dataset.id;
    
    if (this.data.selectedCategory === categoryId) {
      this.setData({ selectedCategory: null });
    } else {
      this.setData({ selectedCategory: categoryId });
    }
    
    this.setData({ page: 1 });
    this.loadTermList(true);
  },

  // 重置筛选
  resetFilter() {
    this.setData({
      selectedCategory: null,
      page: 1
    });
    this.loadTermList(true);
  },

  // 搜索输入
  onSearchInput(e) {
    const value = e.detail.value;
    this.setData({ searchValue: value });
    
    if (value) {
      this.searchTerms(value);
    } else {
      this.setData({ filteredList: this.data.termList });
    }
  },

  // 搜索确认
  onSearchConfirm(e) {
    const value = e.detail.value.trim();
    if (value) {
      this.saveSearchHistory(value);
    }
  },

  // 搜索术语
  searchTerms(value) {
    const mode = this.data.searchMode;
    let filtered = [];
    
    if (mode === 'keyword') {
      // 关键词搜索 (中文/英文)
      filtered = this.data.termList.filter(term => {
        return term.name.includes(value) || 
               (term.nameEn && term.nameEn.toLowerCase().includes(value.toLowerCase()));
      });
    } else if (mode === 'pinyin') {
      // 拼音搜索
      filtered = this.data.termList.filter(term => {
        return term.pinyin && term.pinyin.includes(value.toLowerCase());
      });
    } else if (mode === 'letter') {
      // 首字母搜索
      filtered = this.data.termList.filter(term => {
        const firstLetter = term.firstLetter || (term.nameEn ? term.nameEn.charAt(0).toUpperCase() : '');
        return firstLetter === value.toUpperCase();
      });
    }
    
    this.setData({ filteredList: filtered });
  },

  // 清除搜索
  clearSearch() {
    this.setData({
      searchValue: '',
      filteredList: this.data.termList
    });
  },

  // 保存搜索历史
  saveSearchHistory(keyword) {
    try {
      let history = wx.getStorageSync('searchHistory') || [];
      history = history.filter(k => k !== keyword);
      history.unshift(keyword);
      history = history.slice(0, 10);
      wx.setStorageSync('searchHistory', history);
    } catch (err) {
      console.error('保存搜索历史失败:', err);
    }
  },

  // 跳转详情
  goToDetail(e) {
    const termId = e.currentTarget.dataset.id;
    this.loadTermDetail(termId);
  },

  // 加载术语详情
  async loadTermDetail(termId) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getTermDetail',
        data: { termId }
      });
      
      if (res.result && res.result.success) {
        const term = res.result.data;
        
        // 检查收藏状态
        const collectedTerms = wx.getStorageSync('collectedTerms') || [];
        const isCollected = collectedTerms.includes(termId);
        
        this.setData({
          selectedTerm: term,
          isCollected
        });
      }
    } catch (err) {
      console.error('加载术语详情失败:', err);
      
      // 降级：使用本地数据
      try {
        const terms = require('../../data/terms.json');
        const term = terms.find(t => t._id === termId || t.id === termId);
        
        if (term) {
          const collectedTerms = wx.getStorageSync('collectedTerms') || [];
          const isCollected = collectedTerms.includes(termId);
          
          this.setData({
            selectedTerm: term,
            isCollected
          });
        }
      } catch (localErr) {
        wx.showToast({ title: '加载失败', icon: 'none' });
      }
    }
  },

  // 关闭详情
  closeDetail() {
    this.setData({ selectedTerm: null });
  },

  // 防止关闭
  preventClose() {
    // 空函数，防止点击内容关闭弹窗
  },

  // 切换收藏
  async toggleCollection() {
    const termId = this.data.selectedTerm._id;
    const isCollected = this.data.isCollected;
    
    try {
      let collectedTerms = wx.getStorageSync('collectedTerms') || [];
      
      if (isCollected) {
        collectedTerms = collectedTerms.filter(id => id !== termId);
        wx.showToast({ title: '已取消收藏', icon: 'none' });
      } else {
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
      title: 'AI 词星球 - 探索 AI 知识宇宙',
      path: '/pages/dictionary/list/index',
      withShareTicket: true
    };
  }
});
