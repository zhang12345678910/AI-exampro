// utils/api.js - 云开发 API 封装

const db = wx.cloud.database()
const _ = db.command

/**
 * 用户登录
 */
export async function login(userInfo) {
  return await wx.cloud.callFunction({
    name: 'login',
    data: { userInfo }
  })
}

/**
 * 获取用户信息
 */
export async function getUserInfo() {
  const wxContext = wx.cloud.getWXContext()
  const res = await db.collection('users').doc(wxContext.OPENID).get()
  return res.data
}

/**
 * 获取统计信息
 */
export async function getStats() {
  return await wx.cloud.callFunction({
    name: 'stats',
    data: { action: 'getStats' }
  })
}

/**
 * 标记已学
 */
export async function markLearned(termId) {
  return await wx.cloud.callFunction({
    name: 'stats',
    data: { action: 'markLearned', termId }
  })
}

/**
 * 取消已学
 */
export async function unmarkLearned(termId) {
  return await wx.cloud.callFunction({
    name: 'stats',
    data: { action: 'unmarkLearned', termId }
  })
}

/**
 * 收藏术语
 */
export async function collectTerm(termId) {
  const wxContext = wx.cloud.getWXContext()
  await db.collection('users').doc(wxContext.OPENID).update({
    data: {
      collectedTerms: _.addToSet(termId)
    }
  })
}

/**
 * 取消收藏
 */
export async function uncollectTerm(termId) {
  const wxContext = wx.cloud.getWXContext()
  await db.collection('users').doc(wxContext.OPENID).update({
    data: {
      collectedTerms: _.pull(termId)
    }
  })
}

/**
 * 切换收藏状态
 */
export async function toggleCollect(termId, collect) {
  if (collect) {
    await collectTerm(termId)
  } else {
    await uncollectTerm(termId)
  }
}

/**
 * 保存测验成绩
 */
export async function saveQuizScore(score, total) {
  const wxContext = wx.cloud.getWXContext()
  await db.collection('users').doc(wxContext.OPENID).update({
    data: {
      quizScores: _.push({
        score,
        total,
        date: new Date().toISOString()
      })
    }
  })
}

/**
 * 获取术语列表
 */
export async function getTermList(page = 1, pageSize = 20) {
  return await db.collection('terms')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .orderBy('difficulty', 'asc')
    .get()
}

/**
 * 获取术语详情
 */
export async function getTermDetail(termId) {
  return await db.collection('terms').doc(termId).get()
}

/**
 * 获取收藏列表
 */
export async function getCollectedTerms() {
  const user = await getUserInfo()
  const ids = user?.collectedTerms || []
  
  if (ids.length === 0) return []
  
  return await db.collection('terms')
    .where({
      _id: _.in(ids)
    })
    .get()
}

/**
 * 获取已学列表
 */
export async function getLearnedTerms() {
  const user = await getUserInfo()
  const ids = user?.learnedTerms || []
  
  if (ids.length === 0) return []
  
  return await db.collection('terms')
    .where({
      _id: _.in(ids)
    })
    .get()
}

/**
 * 获取测验题目
 */
export async function getQuizQuestions(limit = 10) {
  return await db.collection('quiz_questions')
    .limit(limit)
    .get()
}
