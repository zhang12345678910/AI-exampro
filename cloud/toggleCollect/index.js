// cloud/toggleCollect/index.js - 收藏/取消收藏云函数
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  const { termId, collect } = event
  
  try {
    if (!termId) {
      return { success: false, error: '缺少术语 ID' }
    }
    
    if (collect) {
      // 收藏
      await db.collection('users').doc(openId).update({
        data: {
          collectedTerms: _.addToSet(termId)
        }
      })
    } else {
      // 取消收藏
      await db.collection('users').doc(openId).update({
        data: {
          collectedTerms: _.pull(termId)
        }
      })
    }
    
    return { success: true }
  } catch (err) {
    console.error('收藏操作失败:', err)
    return {
      success: false,
      error: err.message
    }
  }
}
