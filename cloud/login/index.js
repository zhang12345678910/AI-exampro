// cloud/login/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  
  try {
    // 查询用户是否存在
    const userRes = await db.collection('users').doc(openId).get()
    
    if (userRes.data) {
      // 用户已存在，更新最后登录时间
      await db.collection('users').doc(openId).update({
        data: {
          lastLoginAt: db.serverDate()
        }
      })
      
      return {
        success: true,
        user: userRes.data
      }
    } else {
      // 创建新用户
      const newUser = {
        _id: openId,
        openId,
        nickName: event.userInfo?.nickName || 'AI 学习者',
        avatarUrl: event.userInfo?.avatarUrl || '',
        learnedTerms: [],
        collectedTerms: [],
        quizScores: [],
        createdAt: db.serverDate(),
        lastLoginAt: db.serverDate()
      }
      
      await db.collection('users').doc(openId).set({
        data: newUser
      })
      
      return {
        success: true,
        user: newUser,
        isNew: true
      }
    }
  } catch (err) {
    console.error('登录失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
