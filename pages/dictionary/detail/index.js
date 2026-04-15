// pages/dictionary/detail/index.js - 名词详情页逻辑 (宇宙星空主题)
const app = getApp();

Page({
  data: {
    term: null,
    loading: true,
    isCollected: false,
    relatedTerms: [],
    hasNote: false,
    noteContent: '',
    showNoteEditor: false
  },

  onLoad: function (options) {
    if (options.id) {
      this.loadTermDetail(options.id);
    } else if (options.name) {
      this.loadTermByName(options.name);
    }
  },

  onShareAppMessage: function () {
    const term = this.data.term;
    return {
      title: term ? `分享 AI 术语：${term.name}` : '分享 AI 词星球',
      path: `/pages/dictionary/detail/index?id=${term ? term._id : ''}`,
      imageUrl: ''
    };
  },

  // 加载术语详情
  async loadTermDetail(termId) {
    this.setData({ loading: true });
    
    try {
      const res = await wx.cloud.callFunction({
        name: 'getTermDetail',
        data: { termId }
      });
      
      if (res.result && res.result.success) {
        const term = res.result.data;
        
        this.setData({ 
          term: term,
          relatedTerms: term.relatedTerms || [],
          loading: false 
        });
        
        this.checkCollectionStatus(termId);
        this.checkNoteStatus(termId);
        this.updateViewCount(termId);
        this.addToRecentViews(term);
      }
    } catch (err) {
      console.error('加载术语详情失败:', err);
      this.loadLocalTerm(termId);
    }
  },

  // 通过名称加载
  async loadTermByName(name) {
    try {
      const res = await wx.cloud.callFunction({
        name: 'getTermList',
        data: {
          search: name,
          page: 1,
          pageSize: 1
        }
      });
      
      if (res.result && res.result.success && res.result.data.length > 0) {
        this.loadTermDetail(res.result.data[0]._id);
      }
    } catch (err) {
      console.error('搜索术语失败:', err);
    }
  },

  // 加载本地术语 (降级)
  loadLocalTerm(termId) {
    try {
      const terms = require('../../data/terms.json');
      const term = terms.find(t => t._id === termId || t.id === termId);
      
      if (term) {
        this.setData({ 
          term: term, 
          loading: false,
          relatedTerms: terms.filter(t => t.category === term.category && t._id !== term._id).slice(0, 5)
        });
        this.checkCollectionStatus(termId);
      } else {
        wx.showToast({ title: '术语不存在', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      }
    } catch (err) {
      console.error('加载本地术语失败:', err);
      this.setData({ loading: false });
    }
  },

  // 检查收藏状态
  checkCollectionStatus(termId) {
    try {
      const collectedTerms = wx.getStorageSync('collectedTerms') || [];
      this.setData({ isCollected: collectedTerms.includes(termId) });
    } catch (err) {
      console.error('检查收藏状态失败:', err);
    }
  },

  // 检查笔记状态
  checkNoteStatus(termId) {
    try {
      const notes = wx.getStorageSync('userNotes') || [];
      const note = notes.find(n => n.termId === termId);
      
      if (note) {
        this.setData({ hasNote: true, noteContent: note.content });
      }
    } catch (err) {
      console.error('检查笔记状态失败:', err);
    }
  },

  // 更新浏览次数
  async updateViewCount(termId) {
    try {
      await wx.cloud.callFunction({
        name: 'updateTermView',
        data: { termId, increment: 1 }
      });
    } catch (err) {
      console.error('更新浏览次数失败:', err);
    }
  },

  // 添加到最近浏览
  addToRecentViews(term) {
    try {
      let views = wx.getStorageSync('recentViews') || [];
      views = views.filter(v => v.termId !== term._id);
      views.unshift({
        termId: term._id,
        name: term.name,
        viewedAt: new Date().toLocaleDateString('zh-CN')
      });
      views = views.slice(0, 20);
      wx.setStorageSync('recentViews', views);
    } catch (err) {
      console.error('添加最近浏览失败:', err);
    }
  },

  // 切换收藏
  async toggleCollection() {
    const termId = this.data.term._id;
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

  // 显示笔记编辑器
  showNoteEditor() {
    this.setData({ showNoteEditor: true });
  },

  // 隐藏笔记编辑器
  hideNoteEditor() {
    this.setData({ showNoteEditor: false });
  },

  // 防止关闭
  preventClose() {
    // 空函数
  },

  // 笔记输入
  onNoteInput(e) {
    this.setData({ noteContent: e.detail.value });
  },

  // 保存笔记
  saveNote() {
    const content = this.data.noteContent.trim();
    const termId = this.data.term._id;
    
    if (!content) {
      wx.showToast({ title: '请输入笔记内容', icon: 'none' });
      return;
    }
    
    try {
      let notes = wx.getStorageSync('userNotes') || [];
      const existingIndex = notes.findIndex(n => n.termId === termId);
      
      const noteData = {
        termId: termId,
        termName: this.data.term.name,
        content: content,
        updatedAt: Date.now()
      };
      
      if (existingIndex >= 0) {
        notes[existingIndex] = noteData;
      } else {
        noteData.createdAt = Date.now();
        notes.push(noteData);
      }
      
      wx.setStorageSync('userNotes', notes);
      this.setData({ 
        hasNote: true, 
        noteContent: content,
        showNoteEditor: false 
      });
      
      wx.showToast({ title: '笔记已保存', icon: 'success' });
    } catch (err) {
      console.error('保存笔记失败:', err);
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  // 删除笔记
  deleteNote() {
    const termId = this.data.term._id;
    
    wx.showModal({
      title: '删除笔记',
      content: '确定要删除这条笔记吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            let notes = wx.getStorageSync('userNotes') || [];
            notes = notes.filter(n => n.termId !== termId);
            wx.setStorageSync('userNotes', notes);
            
            this.setData({ hasNote: false, noteContent: '' });
            wx.showToast({ title: '已删除', icon: 'success' });
          } catch (err) {
            console.error('删除笔记失败:', err);
          }
        }
      }
    });
  },

  // 生成卡片
  generateCard() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  // 分享术语
  shareTerm() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 跳转相关术语
  goToRelatedTerm(e) {
    const termId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/dictionary/detail/index?id=${termId}`
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});
