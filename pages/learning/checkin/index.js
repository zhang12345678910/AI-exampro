// pages/learning/checkin/index.js - 打卡日历页逻辑
const app = getApp();

Page({
  data: {
    currentTab: 'learning',
    
    // 打卡统计
    continuousCheckInDays: 0,
    totalCheckInDays: 0,
    currentStreak: 0,
    
    // 日历
    currentYear: 2026,
    currentMonth: 4,
    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    calendarDays: [],
    
    // 勋章
    availableBadges: [
      { badgeId: 'badge_003', name: '入门小能手', icon: '🏅', condition: '连续打卡 3 天', unlocked: false },
      { badgeId: 'badge_007', name: '坚持达人', icon: '🔥', condition: '连续打卡 7 天', unlocked: false },
      { badgeId: 'badge_030', name: '月度王者', icon: '👑', condition: '连续打卡 30 天', unlocked: false }
    ]
  },

  onLoad: function () {
    const today = new Date();
    this.setData({
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth() + 1
    });
    this.loadCheckInData();
    this.generateCalendar();
  },

  onShow: function () {
    this.loadCheckInData();
    this.generateCalendar();
  },

  // 加载打卡数据
  loadCheckInData() {
    try {
      const checkInCalendar = wx.getStorageSync('checkInCalendar') || {};
      
      // 计算总打卡天数
      let totalDays = 0;
      for (const date in checkInCalendar) {
        if (checkInCalendar[date]) {
          totalDays++;
        }
      }
      
      // 计算连续打卡
      let continuousDays = 0;
      const today = new Date().toISOString().split('T')[0];
      const dates = Object.keys(checkInCalendar).sort().reverse();
      
      for (let i = 0; i < dates.length; i++) {
        if (checkInCalendar[dates[i]]) {
          continuousDays++;
        } else {
          break;
        }
      }
      
      // 检查勋章解锁状态
      const availableBadges = this.data.availableBadges.map(badge => ({
        ...badge,
        unlocked: continuousDays >= this.getBadgeRequirement(badge.badgeId)
      }));
      
      this.setData({
        continuousCheckInDays: continuousDays,
        totalCheckInDays: totalDays,
        currentStreak: continuousDays,
        availableBadges
      });
    } catch (err) {
      console.error('加载打卡数据失败:', err);
    }
  },

  // 获取勋章要求
  getBadgeRequirement(badgeId) {
    const requirements = {
      'badge_003': 3,
      'badge_007': 7,
      'badge_030': 30
    };
    return requirements[badgeId] || 0;
  },

  // 生成日历
  generateCalendar() {
    const year = this.data.currentYear;
    const month = this.data.currentMonth;
    
    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    
    // 获取第一天是星期几
    const firstDayWeek = firstDay.getDay();
    
    // 获取总天数
    const totalDays = lastDay.getDate();
    
    // 获取打卡数据
    const checkInCalendar = wx.getStorageSync('checkInCalendar') || {};
    const today = new Date().toISOString().split('T')[0];
    
    // 生成日期数组
    const calendarDays = [];
    
    // 添加上个月的日期
    for (let i = 0; i < firstDayWeek; i++) {
      calendarDays.push({
        day: '',
        date: '',
        isToday: false,
        isCheckedIn: false,
        isFuture: false
      });
    }
    
    // 添加当月日期
    for (let day = 1; day <= totalDays; day++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isToday = date === today;
      const isCheckedIn = !!checkInCalendar[date];
      const isFuture = new Date(date) > new Date(today);
      
      calendarDays.push({
        day,
        date,
        isToday,
        isCheckedIn,
        isFuture
      });
    }
    
    this.setData({ calendarDays });
  },

  // 上个月
  prevMonth() {
    let year = this.data.currentYear;
    let month = this.data.currentMonth - 1;
    
    if (month < 1) {
      month = 12;
      year--;
    }
    
    this.setData({
      currentYear: year,
      currentMonth: month
    });
    
    this.generateCalendar();
  },

  // 下个月
  nextMonth() {
    const today = new Date();
    let year = this.data.currentYear;
    let month = this.data.currentMonth + 1;
    
    if (month > 12) {
      month = 1;
      year++;
    }
    
    // 不能查看未来月份
    if (year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth() + 1)) {
      wx.showToast({ title: '不能查看未来月份', icon: 'none' });
      return;
    }
    
    this.setData({
      currentYear: year,
      currentMonth: month
    });
    
    this.generateCalendar();
  },

  // 选择日期
  selectDay(e) {
    const date = e.currentTarget.dataset.date;
    
    if (!date) {
      return;
    }
    
    const checkInCalendar = wx.getStorageSync('checkInCalendar') || {};
    const isCheckedIn = !!checkInCalendar[date];
    
    if (isCheckedIn) {
      wx.showToast({ title: '该日已打卡', icon: 'none' });
    } else {
      wx.showToast({ title: '该日未打卡', icon: 'none' });
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
  }
});
