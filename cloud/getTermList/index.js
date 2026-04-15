// cloudFunctions/getTermList/index.js
// 获取术语列表云函数

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  try {
    const {
      page = 1,
      pageSize = 20,
      category,
      subCategory,
      difficulty,
      search,
      searchMode = 'keyword',
      letter,
      orderBy = 'viewCount',
      order = 'desc'
    } = event;
    
    // 构建查询条件
    let query = db.collection('terms');
    const conditions = [];
    
    // 分类筛选
    if (category) {
      conditions.push({ category });
    }
    
    // 子分类筛选
    if (subCategory) {
      conditions.push({ subCategory });
    }
    
    // 难度筛选
    if (difficulty !== undefined && difficulty !== null) {
      conditions.push({ difficulty });
    }
    
    // 搜索
    if (search) {
      const searchQuery = buildSearchQuery(search, searchMode);
      if (Object.keys(searchQuery).length > 0) {
        conditions.push(searchQuery);
      }
    }
    
    // 字母索引
    if (letter) {
      conditions.push({ firstLetter: letter.toUpperCase() });
    }
    
    // 应用查询条件
    if (conditions.length > 0) {
      query = query.where(_.or(conditions));
    }
    
    // 排序
    const orderDir = order === 'desc' ? _.desc : _.asc;
    query = query.orderBy(orderBy, orderDir);
    
    // 分页
    const skip = (page - 1) * pageSize;
    query = query.skip(skip).limit(pageSize);
    
    // 执行查询
    const res = await query.get();
    
    // 获取总数（用于判断是否有更多）
    const countQuery = conditions.length > 0 
      ? db.collection('terms').where(_.or(conditions))
      : db.collection('terms');
    const totalRes = await countQuery.count();
    
    return {
      success: true,
      data: res.data,
      pagination: {
        page: page,
        pageSize: pageSize,
        total: totalRes.total,
        hasMore: skip + res.data.length < totalRes.total
      }
    };
    
  } catch (err) {
    console.error('获取术语列表失败:', err);
    
    // 降级方案：返回本地术语库
    try {
      const terms = require('./data/terms.json');
      const pageSize = event.pageSize || 20;
      const page = event.page || 1;
      const skip = (page - 1) * pageSize;
      
      let filtered = terms;
      
      // 简单筛选
      if (event.category) {
        filtered = filtered.filter(t => t.category === event.category);
      }
      
      if (event.search) {
        const search = event.search.toLowerCase();
        filtered = filtered.filter(t => 
          t.name.includes(event.search) || 
          (t.nameEn && t.nameEn.toLowerCase().includes(search))
        );
      }
      
      const paginated = filtered.slice(skip, skip + pageSize);
      
      return {
        success: true,
        data: paginated,
        pagination: {
          page: page,
          pageSize: pageSize,
          total: filtered.length,
          hasMore: skip + paginated.length < filtered.length
        },
        source: 'local'
      };
    } catch (localErr) {
      console.error('降级方案也失败:', localErr);
    }
    
    return {
      success: false,
      error: err.message
    };
  }
};

/**
 * 构建搜索查询
 */
function buildSearchQuery(search, mode) {
  if (!search) return {};
  
  if (mode === 'keyword') {
    // 关键词搜索：匹配中文名称或英文名称
    return _.or([
      { name: db.RegExp({ regexp: search, options: 'i' }) },
      { nameEn: db.RegExp({ regexp: search, options: 'i' }) }
    ]);
  } else if (mode === 'pinyin') {
    // 拼音搜索
    return { pinyin: db.RegExp({ regexp: search, options: 'i' }) };
  } else if (mode === 'initial') {
    // 首字母搜索
    return { firstLetter: search.toUpperCase() };
  }
  
  return {};
}
