// cloud/stats/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  
  try {
    const action = event.action
    
    if (action === 'getStats') {
      // 获取用户统计
      const userRes = await db.collection('users').doc(openId).get()
      const user = userRes.data
      
      return {
        success: true,
        stats: {
          learnedCount: user?.learnedTerms?.length || 0,
          collectedCount: user?.collectedTerms?.length || 0,
          quizCount: user?.quizScores?.length || 0,
          avgScore: calculateAvgScore(user?.quizScores || [])
        }
      }
    } else if (action === 'markLearned') {
      // 标记已学
      const termId = event.termId
      await db.collection('users').doc(openId).update({
        data: {
          learnedTerms: _.addToSet(termId)
        }
      })
      return { success: true }
    } else if (action === 'unmarkLearned') {
      // 取消已学
      const termId = event.termId
      await db.collection('users').doc(openId).update({
        data: {
          learnedTerms: _.pull(termId)
        }
      })
      return { success: true }
    }
    
    return { success: false, error: '未知操作' }
  } catch (err) {
    console.error('统计操作失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}

// 计算平均分
function calculateAvgScore(scores) {
  if (!scores || scores.length === 0) return 0
  const total = scores.reduce((sum, s) => sum + (s.score || 0), 0)
  return Math.round(total / scores.length)
}
