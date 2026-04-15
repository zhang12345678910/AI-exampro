// cloudFunctions/checkIn/index.js
// 每日打卡云函数

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const wxContext = cloud.getWXContext();
    const openId = wxContext.OPENID;
    
    if (!openId) {
      return {
        success: false,
        error: '无法获取用户 OpenID'
      };
    }
    
    const { date } = event;
    const today = date || new Date().toISOString().split('T')[0];
    const todayTimestamp = new Date(today).getTime();
    
    // 1. 获取用户信息
    const userRes = await db.collection('users').doc(openId).get();
    const user = userRes.data;
    
    if (!user) {
      // 用户不存在，创建新用户
      const newUser = {
        openId: openId,
        nickName: event.nickName || 'AI 学习者',
        avatarUrl: event.avatarUrl || '',
        level: 'AI 萌新',
        stats: {
          totalLearnedDays: 1,
          learnedTermsCount: 0,
          collectedTermsCount: 0,
          continuousCheckInDays: 1,
          totalCheckInDays: 1,
          quizTotalCount: 0,
          quizAvgScore: 0
        },
        checkInCalendar: {
          [today]: true
        },
        badges: [],
        createdAt: db.serverDate(),
        lastLoginAt: db.serverDate()
      };
      
      await db.collection('users').doc(openId).set({
        data: newUser
      });
      
      return {
        success: true,
        isNewUser: true,
        continuousDays: 1,
        totalDays: 1,
        date: today,
        message: '首次打卡成功！欢迎加入 AI 词星球！'
      };
    }
    
    // 2. 检查今天是否已打卡
    const checkInCalendar = user.checkInCalendar || {};
    if (checkInCalendar[today]) {
      return {
        success: false,
        alreadyCheckedIn: true,
        continuousDays: user.stats.continuousCheckInDays || 0,
        totalDays: user.stats.totalCheckInDays || 0,
        message: '今天已经打卡过了哦~'
      };
    }
    
    // 3. 计算连续打卡天数
    let continuousDays = user.stats.continuousCheckInDays || 0;
    const yesterday = new Date(todayTimestamp - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (checkInCalendar[yesterday]) {
      // 昨天也打卡了，连续天数 +1
      continuousDays++;
    } else {
      // 昨天没打卡，重置为 1
      continuousDays = 1;
    }
    
    // 4. 更新用户打卡记录
    const updateData = {
      'checkInCalendar.' + today: true,
      'stats.continuousCheckInDays': continuousDays,
      'stats.totalCheckInDays': (user.stats.totalCheckInDays || 0) + 1,
      lastLoginAt: db.serverDate()
    };
    
    await db.collection('users').doc(openId).update({
      data: updateData
    });
    
    // 5. 检查是否解锁新勋章
    const newBadges = [];
    const existingBadgeIds = (user.badges || []).map(b => b.badgeId);
    
    // 连续打卡 3 天
    if (continuousDays >= 3 && !existingBadgeIds.includes('badge_003')) {
      newBadges.push({
        badgeId: 'badge_003',
        name: '入门小能手',
        unlockedAt: Date.now()
      });
    }
    
    // 连续打卡 7 天
    if (continuousDays >= 7 && !existingBadgeIds.includes('badge_007')) {
      newBadges.push({
        badgeId: 'badge_007',
        name: '坚持达人',
        unlockedAt: Date.now()
      });
    }
    
    // 连续打卡 30 天
    if (continuousDays >= 30 && !existingBadgeIds.includes('badge_030')) {
      newBadges.push({
        badgeId: 'badge_030',
        name: '月度王者',
        unlockedAt: Date.now()
      });
    }
    
    // 如果有新勋章，添加到用户数据
    if (newBadges.length > 0) {
      await db.collection('users').doc(openId).update({
        data: {
          badges: db.command.push(...newBadges)
        }
      });
    }
    
    // 6. 返回结果
    let message = '打卡成功！';
    if (newBadges.length > 0) {
      message = `恭喜解锁 ${newBadges.length} 个新勋章：${newBadges.map(b => b.name).join('、')}！`;
    } else if (continuousDays >= 7) {
      message = `太棒了！已连续打卡 ${continuousDays} 天！`;
    }
    
    return {
      success: true,
      isNewUser: false,
      continuousDays: continuousDays,
      totalDays: (user.stats.totalCheckInDays || 0) + 1,
      date: today,
      newBadges: newBadges,
      message: message
    };
    
  } catch (err) {
    console.error('打卡失败:', err);
    return {
      success: false,
      error: err.message
    };
  }
};
