// pages/profile/notes/index.js - 笔记管理页逻辑
const format = require('../../../utils/format.js');

Page({
  data: { notes: [], filteredNotes: [], searchValue: '' },

  onLoad: function () { this.loadNotes(); },
  onShow: function () { this.loadNotes(); },

  loadNotes() {
    try {
      const notes = wx.getStorageSync('userNotes') || [];
      // 添加格式化日期
      const notesWithDate = notes.map(note => ({
        ...note,
        formattedDate: format.formatDate(note.updatedAt)
      }));
      this.setData({ notes: notesWithDate, filteredNotes: notesWithDate });
    } catch (err) { console.error('加载笔记失败:', err); }
  },

  onSearchInput(e) {
    const value = e.detail.value;
    this.setData({ searchValue: value });
    if (value) {
      const filtered = this.data.notes.filter(n => n.termName.includes(value) || n.content.includes(value));
      this.setData({ filteredNotes: filtered });
    } else {
      this.setData({ filteredNotes: this.data.notes });
    }
  },

  clearSearch() { this.setData({ searchValue: '', filteredNotes: this.data.notes }); },

  goToTerm(e) { wx.navigateTo({ url: `/pages/dictionary/detail/index?id=${e.currentTarget.dataset.termid}` }); },

  editNote(e) { wx.showToast({ title: '功能开发中', icon: 'none' }); },

  deleteNote(e) {
    const termId = e.currentTarget.dataset.termid;
    wx.showModal({
      title: '删除笔记', content: '确定要删除吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            let notes = wx.getStorageSync('userNotes') || [];
            notes = notes.filter(n => n.termId !== termId);
            wx.setStorageSync('userNotes', notes);
            this.loadNotes();
            wx.showToast({ title: '已删除', icon: 'success' });
          } catch (err) { console.error('删除失败:', err); }
        }
      }
    });
  },

  // 格式化日期
  formatDate: format.formatDate
});
