// pages/learning/quiz/index.js - 测验页逻辑
const app = getApp();

Page({
  data: {
    currentTab: 'learning',
    level: 0,
    questions: [],
    currentQuestion: 0,
    selectedAnswer: null,
    showResult: false,
    score: 0,
    correctCount: 0,
    quizFinished: false,
    timeSpent: 0,
    startTime: 0
  },

  onLoad: function (options) {
    const level = parseInt(options.level) || 0;
    this.setData({ level });
    this.loadQuizQuestions(level);
  },

  onShow: function () {
    if (!this.data.quizFinished && this.data.questions.length > 0) {
      this.setData({
        startTime: Date.now()
      });
    }
  },

  onUnload: function () {
    // 清理定时器
    if (this.timer) {
      clearInterval(this.timer);
    }
  },

  // 加载测验题目
  async loadQuizQuestions(level) {
    try {
      const db = wx.cloud.database();
      const res = await db.collection('quiz_questions')
        .where({ level: this.getLevelName(level) })
        .limit(5)
        .get();
      
      if (res.data.length > 0) {
        this.setData({ 
          questions: res.data,
          startTime: Date.now()
        });
        
        // 开始计时
        this.startTimer();
      } else {
        // 使用本地数据
        this.loadLocalQuestions(level);
      }
    } catch (err) {
      console.error('加载题目失败:', err);
      this.loadLocalQuestions(level);
    }
  },

  // 获取级别名称
  getLevelName(level) {
    const levels = ['入门', '进阶', '专业'];
    return levels[level] || '入门';
  },

  // 加载本地题目
  loadLocalQuestions(level) {
    try {
      const questions = require('../../data/quiz_questions.json');
      const filtered = questions.filter(q => q.level === this.getLevelName(level));
      this.setData({ 
        questions: filtered.slice(0, 5),
        startTime: Date.now()
      });
      this.startTimer();
    } catch (err) {
      console.error('加载本地题目失败:', err);
    }
  },

  // 开始计时
  startTimer() {
    this.timer = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - this.data.startTime) / 1000);
      this.setData({ timeSpent });
    }, 1000);
  },

  // 选择答案
  selectOption(e) {
    if (this.data.showResult) {
      return;
    }
    
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({ selectedAnswer: index });
  },

  // 提交答案
  submitAnswer() {
    if (this.data.selectedAnswer === null) {
      wx.showToast({ title: '请选择答案', icon: 'none' });
      return;
    }
    
    if (this.data.showResult) {
      // 下一题
      this.nextQuestion();
    } else {
      // 提交答案
      this.checkAnswer();
    }
  },

  // 检查答案
  checkAnswer() {
    const question = this.data.questions[this.data.currentQuestion];
    const isCorrect = this.data.selectedAnswer === question.answer;
    
    this.setData({
      showResult: true,
      correctCount: isCorrect ? this.data.correctCount + 1 : this.data.correctCount,
      score: isCorrect ? this.data.score + (100 / this.data.questions.length) : this.data.score
    });
    
    // 播放音效 (可选)
    if (isCorrect) {
      wx.vibrateShort({ type: 'success' });
    } else {
      wx.vibrateShort({ type: 'error' });
    }
  },

  // 下一题
  nextQuestion() {
    const currentQuestion = this.data.currentQuestion + 1;
    
    if (currentQuestion >= this.data.questions.length) {
      // 测验结束
      this.finishQuiz();
    } else {
      this.setData({
        currentQuestion,
        selectedAnswer: null,
        showResult: false
      });
    }
  },

  // 完成测验
  finishQuiz() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    const finalScore = Math.round(this.data.score);
    
    // 保存测验记录
    this.saveQuizRecord(finalScore);
    
    this.setData({
      quizFinished: true,
      score: finalScore
    });
  },

  // 保存测验记录
  async saveQuizRecord(score) {
    try {
      const user = app.globalData.userInfo;
      
      if (user && user.openId) {
        const db = wx.cloud.database();
        await db.collection('users').doc(user.openId).update({
          data: {
            'quizScores': db.command.push({
              date: new Date().toISOString().split('T')[0],
              level: this.getLevelName(this.data.level),
              score: score,
              total: 100,
              timeSpent: this.data.timeSpent
            }),
            'stats.quizTotalCount': db.command.inc(1)
          }
        });
      }
    } catch (err) {
      console.error('保存测验记录失败:', err);
    }
  },

  // 查看解析
  reviewQuestions() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  // 重新测试
  retryQuiz() {
    this.setData({
      currentQuestion: 0,
      selectedAnswer: null,
      showResult: false,
      score: 0,
      correctCount: 0,
      quizFinished: false,
      timeSpent: 0,
      startTime: Date.now()
    });
    this.startTimer();
  },

  // 返回
  goBack() {
    wx.navigateBack();
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
