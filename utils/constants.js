// utils/constants.js - 常量配置

// 云环境 ID（需替换为实际的）
export const CLOUD_ENV = 'ai-terms-env'

// 分页配置
export const PAGE_SIZE = 20

// 测验配置
export const QUIZ_CONFIG = {
  DEFAULT_QUESTION_COUNT: 10,
  PASSING_SCORE: 60,
  EXCELLENT_SCORE: 80
}

// 难度配置
export const DIFFICULTY = {
  1: { label: '简单', color: '#07c160' },
  2: { label: '中等', color: '#ff9800' },
  3: { label: '困难', color: '#f44336' }
}

// 分类列表
export const CATEGORIES = [
  '基础概念',
  '热门概念',
  '技术领域',
  '学习方法',
  '模型架构',
  '数据概念',
  '任务类型',
  '评估指标',
  '训练概念',
  '优化算法',
  '部署概念'
]

// 标签配置
export const TAGS = {
  HOT: '热门',
  BASIC: '基础',
  CORE: '核心',
  IMPORTANT: '重要',
  PRACTICAL: '实用'
}

// 本地存储键名
export const STORAGE = {
  USER_INFO: 'user_info',
  LEARNED_TERMS: 'learned_terms',
  COLLECTED_TERMS: 'collected_terms',
  QUIZ_SCORES: 'quiz_scores',
  LAST_VISIT: 'last_visit'
}

// 分享配置
export const SHARE_CONFIG = {
  TITLE: 'AI 术语通 - 每天学习一个 AI 术语',
  DESC: '通俗易懂的 AI 学习小程序，快来一起挑战！',
  PATH: '/pages/index/index'
}
