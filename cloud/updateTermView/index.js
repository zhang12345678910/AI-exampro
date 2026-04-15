// cloudFunctions/updateTermView/index.js
// 更新术语浏览次数云函数

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const { termId, increment = 1 } = event;
    
    if (!termId) {
      return {
        success: false,
        error: '缺少参数：termId'
      };
    }
    
    // 更新浏览次数
    await db.collection('terms').doc(termId).update({
      data: {
        viewCount: db.command.inc(increment),
        updatedAt: db.serverDate()
      }
    });
    
    // 获取更新后的术语
    const termRes = await db.collection('terms').doc(termId).get();
    
    return {
      success: true,
      data: {
        termId: termId,
        viewCount: termRes.data.viewCount
      }
    };
    
  } catch (err) {
    console.error('更新浏览次数失败:', err);
    return {
      success: false,
      error: err.message
    };
  }
};
