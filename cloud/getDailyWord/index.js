// cloudFunctions/getDailyWord/index.js
// 获取每日一词云函数

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const { date } = event;
    
    // 获取今天的日期 (YYYY-MM-DD)
    const today = date || new Date().toISOString().split('T')[0];
    
    // 1. 先查找是否有手动配置的每日一词
    const dailyWordRes = await db.collection('daily_word')
      .where({ date: today })
      .limit(1)
      .get();
    
    if (dailyWordRes.data.length > 0) {
      // 有手动配置，返回配置的术语
      const termId = dailyWordRes.data[0].termId;
      const termRes = await db.collection('terms').doc(termId).get();
      
      return {
        success: true,
        data: termRes.data,
        source: 'manual',
        date: today
      };
    }
    
    // 2. 没有手动配置，自动推荐
    // 推荐逻辑：选择浏览次数最少的术语（帮助用户学习未热门的）
    const termsRes = await db.collection('terms')
      .orderBy('viewCount', 'asc')
      .limit(1)
      .get();
    
    if (termsRes.data.length === 0) {
      // 如果没有术语，返回空
      return {
        success: false,
        error: '术语库为空',
        date: today
      };
    }
    
    const term = termsRes.data[0];
    
    // 3. 保存今日每日一词记录
    try {
      await db.collection('daily_word').add({
        data: {
          date: today,
          termId: term._id,
          isManual: false,
          createdAt: db.serverDate()
        }
      });
    } catch (err) {
      // 如果已存在（并发情况），忽略错误
      console.log('保存每日一词记录失败:', err);
    }
    
    return {
      success: true,
      data: term,
      source: 'auto',
      date: today
    };
    
  } catch (err) {
    console.error('获取每日一词失败:', err);
    
    // 降级方案：返回本地术语库的第一个术语
    try {
      const terms = require('./data/terms.json');
      if (terms && terms.length > 0) {
        return {
          success: true,
          data: terms[0],
          source: 'local',
          date: date || new Date().toISOString().split('T')[0]
        };
      }
    } catch (localErr) {
      console.error('降级方案也失败:', localErr);
    }
    
    return {
      success: false,
      error: err.message
    };
  }
};
