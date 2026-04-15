// cloudFunctions/getTermDetail/index.js
// 获取术语详情云函数

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  try {
    const { termId, termName } = event;
    
    if (!termId && !termName) {
      return {
        success: false,
        error: '缺少参数：termId 或 termName'
      };
    }
    
    let termRes;
    
    if (termId) {
      // 通过 ID 查询
      termRes = await db.collection('terms').doc(termId).get();
    } else if (termName) {
      // 通过名称查询
      termRes = await db.collection('terms')
        .where({ name: termName })
        .limit(1)
        .get();
      
      if (termRes.data.length > 0) {
        termRes = { data: termRes.data[0] };
      } else {
        termRes = { data: null };
      }
    }
    
    if (!termRes.data) {
      return {
        success: false,
        error: '术语不存在'
      };
    }
    
    const term = termRes.data;
    
    // 加载相关术语
    let relatedTerms = [];
    if (term.relatedTerms && term.relatedTerms.length > 0) {
      const relatedRes = await db.collection('terms')
        .where({
          _id: db.command.in(term.relatedTerms)
        })
        .limit(5)
        .get();
      relatedTerms = relatedRes.data;
    } else if (term.category) {
      // 同分类的其他术语
      const relatedRes = await db.collection('terms')
        .where({
          category: term.category,
          _id: db.command.neq(term._id)
        })
        .limit(5)
        .get();
      relatedTerms = relatedRes.data;
    }
    
    return {
      success: true,
      data: {
        ...term,
        relatedTerms
      }
    };
    
  } catch (err) {
    console.error('获取术语详情失败:', err);
    
    // 降级方案：从本地加载
    try {
      const terms = require('./data/terms.json');
      const term = terms.find(t => 
        t._id === event.termId || t.name === event.termName
      );
      
      if (term) {
        // 查找相关术语
        const relatedTerms = terms
          .filter(t => t.category === term.category && t._id !== term._id)
          .slice(0, 5);
        
        return {
          success: true,
          data: { ...term, relatedTerms },
          source: 'local'
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
