// cloud/subscribeRemind/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

/**
 * 订阅复习提醒
 * 用户点击订阅后，记录订阅信息
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  
  try {
    // 检查用户是否存在
    const userRes = await db.collection('users').doc(openId).get()
    
    if (!userRes.data) {
      // 创建新用户
      await db.collection('users').doc(openId).set({
        data: {
          openId,
          createdAt: db.serverDate(),
          learnedTerms: [],
          collectedTerms: [],
          quizScores: [],
          remindSubscribed: true,
          remindTime: '20:00' // 默认晚上 8 点提醒
        }
      })
    } else {
      // 更新订阅状态
      await db.collection('users').doc(openId).update({
        data: {
          remindSubscribed: true,
          remindTime: event.remindTime || '20:00',
          lastRemindAt: db.serverDate()
        }
      })
    }
    
    return {
      success: true,
      message: '订阅成功，每晚 8 点提醒你复习'
    }
    
  } catch (err) {
    console.error('订阅提醒失败:', err)
    return {
      success: false,
      message: '订阅失败',
      error: err.message
    }
  }
}
