// cloud/saveQuizScore/index.js - 保存测验成绩云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  const { score, total } = event
  
  try {
    if (score === undefined || total === undefined) {
      return { success: false, error: '缺少成绩参数' }
    }
    
    const quizRecord = {
      score,
      total,
      date: new Date().toISOString(),
      timestamp: Date.now()
    }
    
    await db.collection('users').doc(openId).update({
      data: {
        quizScores: db.command.push(quizRecord)
      }
    })
    
    return { 
      success: true,
      record: quizRecord
    }
  } catch (err) {
    console.error('保存成绩失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
