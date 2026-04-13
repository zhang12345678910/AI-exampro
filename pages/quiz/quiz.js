// pages/quiz/quiz.js
const db = wx.cloud.database()

Page({
  data: {
    questions: [],
    currentQuestion: 0,
    userAnswers: [],
    quizStarted: false,
    quizFinished: false,
    score: 0,
    totalQuestions: 10
  },

  onLoad: function () {
    // 页面加载时不自动开始，等用户点击开始
  },

  // 开始测验
  async startQuiz() {
    wx.showLoading({ title: '加载中...' })
    
    try {
      // 从云数据库获取题目
      const res = await db.collection('quiz_questions')
        .limit(this.data.totalQuestions)
        .get()

      if (res.data.length > 0) {
        this.setData({
          questions: res.data,
          quizStarted: true
        })
      } else {
        // 本地生成题目（降级方案）
        this.generateLocalQuestions()
      }
      
      wx.hideLoading()
    } catch (err) {
      console.error('加载题目失败:', err)
      this.generateLocalQuestions()
      wx.hideLoading()
    }
  },

  // 本地生成题目（降级方案）
  generateLocalQuestions() {
    const localTerms = require('../../data/terms.json')
    const questions = []
    
    for (let i = 0; i < Math.min(10, localTerms.length); i++) {
      const term = localTerms[i]
      const wrongOptions = localTerms
        .filter(t => t.id !== term.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(t => t.definition)
      
      const options = [term.definition, ...wrongOptions].sort(() => Math.random() - 0.5)
      
      questions.push({
        termId: term.id,
        question: `以下哪个是"${term.name}"的正确定义？`,
        options,
        answer: options.indexOf(term.definition),
        term
      })
    }
    
    this.setData({
      questions,
      quizStarted: true
    })
  },

  // 选择答案
  selectAnswer(e) {
    const answerIndex = e.currentTarget.dataset.index
    const currentQuestion = this.data.currentQuestion
    const userAnswers = [...this.data.userAnswers]
    
    userAnswers[currentQuestion] = answerIndex
    this.setData({ userAnswers })

    // 自动进入下一题或提交
    if (currentQuestion < this.data.questions.length - 1) {
      setTimeout(() => {
        this.setData({ currentQuestion: currentQuestion + 1 })
      }, 300)
    } else {
      setTimeout(() => {
        this.submitQuiz()
      }, 300)
    }
  },

  // 提交测验
  submitQuiz() {
    let correctCount = 0
    this.data.questions.forEach((q, i) => {
      if (this.data.userAnswers[i] === q.answer) {
        correctCount++
      }
    })

    const score = Math.round((correctCount / this.data.questions.length) * 100)
    
    this.setData({
      quizFinished: true,
      score
    })

    // 保存成绩
    this.saveScore(score)
  },

  // 保存成绩
  async saveScore(score) {
    try {
      await wx.cloud.callFunction({
        name: 'saveQuizScore',
        data: { score, total: this.data.questions.length }
      })
    } catch (err) {
      console.error('保存成绩失败:', err)
    }
  },

  // 重新开始
  restartQuiz() {
    this.setData({
      currentQuestion: 0,
      userAnswers: [],
      quizStarted: true,
      quizFinished: false,
      score: 0
    })
    this.startQuiz()
  },

  // 返回首页
  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
