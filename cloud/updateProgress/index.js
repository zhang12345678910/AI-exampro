// cloud/updateProgress/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

/**
 * 更新学习进度
 * action: 'markLearned' | 'unmarkLearned'
 */
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  const { action, termId } = event
  
  if (!termId) {
    return { success: false, message: '缺少 termId 参数' }
  }
  
  try {
    // 检查用户是否存在
    const userRes = await db.collection('users').doc(openId).get()
    
    if (!userRes.data) {
      // 用户不存在，先创建
      await db.collection('users').doc(openId).set({
        data: {
          openId,
          createdAt: db.serverDate(),
          learnedTerms: [],
          collectedTerms: [],
          quizScores: []
        }
      })
    }
    
    if (action === 'markLearned') {
      // 标记为已学
      await db.collection('users').doc(openId).update({
        data: {
          learnedTerms: _.addToSet(termId),
          lastLearnedAt: db.serverDate()
        }
      })
      
      return { success: true, message: '已标记为已学' }
      
    } else if (action === 'unmarkLearned') {
      // 取消已学标记
      await db.collection('users').doc(openId).update({
        data: {
          learnedTerms: _.pull(termId)
        }
      })
      
      return { success: true, message: '已取消标记' }
      
    } else {
      return { success: false, message: '未知的 action' }
    }
    
  } catch (err) {
    console.error('更新进度失败:', err)
    return { success: false, message: '更新失败', error: err.message }
  }
}
