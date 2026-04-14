// cloud/getUserInfo/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

/**
 * 获取用户信息
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  
  try {
    const userRes = await db.collection('users').doc(openId).get()
    
    if (userRes.data) {
      return {
        success: true,
        data: userRes.data
      }
    } else {
      // 用户不存在，创建新用户
      const now = db.serverDate()
      await db.collection('users').doc(openId).set({
        data: {
          openId,
          createdAt: now,
          nickName: '新用户',
          learnedTerms: [],
          collectedTerms: [],
          quizScores: [],
          lastLoginAt: now
        }
      })
      
      return {
        success: true,
        data: {
          openId,
          nickName: '新用户',
          learnedTerms: [],
          collectedTerms: [],
          quizScores: []
        }
      }
    }
  } catch (err) {
    console.error('获取用户信息失败:', err)
    return {
      success: false,
      message: '获取失败',
      error: err.message
    }
  }
}
