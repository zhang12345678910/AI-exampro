// utils/storage.js - 本地存储封装

const STORAGE_KEYS = {
  USER_INFO: 'user_info',
  LEARNED_TERMS: 'learned_terms',
  COLLECTED_TERMS: 'collected_terms',
  QUIZ_SCORES: 'quiz_scores',
  LAST_VISIT: 'last_visit'
}

/**
 * 设置存储
 */
export function set(key, value) {
  try {
    wx.setStorageSync(key, value)
    return true
  } catch (err) {
    console.error('存储失败:', err)
    return false
  }
}

/**
 * 获取存储
 */
export function get(key, defaultValue = null) {
  try {
    const value = wx.getStorageSync(key)
    return value !== '' ? value : defaultValue
  } catch (err) {
    console.error('读取存储失败:', err)
    return defaultValue
  }
}

/**
 * 删除存储
 */
export function remove(key) {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (err) {
    console.error('删除存储失败:', err)
    return false
  }
}

/**
 * 清空存储
 */
export function clear() {
  try {
    wx.clearStorageSync()
    return true
  } catch (err) {
    console.error('清空存储失败:', err)
    return false
  }
}

// 便捷方法
export const userInfo = {
  get: () => get(STORAGE_KEYS.USER_INFO),
  set: (v) => set(STORAGE_KEYS.USER_INFO, v),
  remove: () => remove(STORAGE_KEYS.USER_INFO)
}

export const learnedTerms = {
  get: () => get(STORAGE_KEYS.LEARNED_TERMS, []),
  set: (v) => set(STORAGE_KEYS.LEARNED_TERMS, v),
  add: (termId) => {
    const terms = learnedTerms.get()
    if (!terms.includes(termId)) {
      terms.push(termId)
      learnedTerms.set(terms)
    }
  },
  remove: (termId) => {
    const terms = learnedTerms.get().filter(id => id !== termId)
    learnedTerms.set(terms)
  }
}

export const collectedTerms = {
  get: () => get(STORAGE_KEYS.COLLECTED_TERMS, []),
  set: (v) => set(STORAGE_KEYS.COLLECTED_TERMS, v),
  add: (termId) => {
    const terms = collectedTerms.get()
    if (!terms.includes(termId)) {
      terms.push(termId)
      collectedTerms.set(terms)
    }
  },
  remove: (termId) => {
    const terms = collectedTerms.get().filter(id => id !== termId)
    collectedTerms.set(terms)
  }
}

export const quizScores = {
  get: () => get(STORAGE_KEYS.QUIZ_SCORES, []),
  add: (score) => {
    const scores = quizScores.get()
    scores.push({ score, date: new Date().toISOString() })
    // 只保留最近 10 次
    if (scores.length > 10) scores.shift()
    quizScores.set(scores)
  }
}

export const lastVisit = {
  get: () => get(STORAGE_KEYS.LAST_VISIT),
  set: () => set(STORAGE_KEYS.LAST_VISIT, Date.now())
}
