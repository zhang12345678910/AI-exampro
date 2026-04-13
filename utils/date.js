// utils/date.js - 日期处理（iOS 兼容）

/**
 * 解析日期字符串（兼容 iOS）
 * @param {string} dateStr - 日期字符串，如 '2026-04-13' 或 '2026-04-13T10:00:00'
 * @returns {Date}
 */
export function parseDate(dateStr) {
  if (!dateStr) return new Date()
  
  // iOS 不支持横杠，需要转换为斜杠
  const normalized = dateStr.replace(/-/g, '/')
  return new Date(normalized)
}

/**
 * 格式化日期
 * @param {Date|number} date - 日期对象或时间戳
 * @param {string} format - 格式，如 'YYYY-MM-DD' 或 'MM/DD'
 * @returns {string}
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  const d = date instanceof Date ? date : new Date(date)
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
}

/**
 * 获取相对时间描述
 * @param {Date|number} date - 日期对象或时间戳
 * @returns {string} 如 "刚刚"、"10 分钟前"、"2 小时前"
 */
export function getRelativeTime(date) {
  const now = Date.now()
  const target = date instanceof Date ? date.getTime() : date
  const diff = now - target
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return formatDate(date, 'MM/DD')
}

/**
 * 判断是否是今天
 * @param {Date|number} date - 日期对象或时间戳
 * @returns {boolean}
 */
export function isToday(date) {
  const d = date instanceof Date ? date : new Date(date)
  const now = new Date()
  return d.getFullYear() === now.getFullYear() &&
         d.getMonth() === now.getMonth() &&
         d.getDate() === now.getDate()
}

/**
 * 获取星期几
 * @param {Date|number} date - 日期对象或时间戳
 * @returns {string} 如 "周一"、"周二"
 */
export function getWeekDay(date) {
  const d = date instanceof Date ? date : new Date(date)
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekDays[d.getDay()]
}
