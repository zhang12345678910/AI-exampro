/**
 * 格式化工具函数
 * 用于日期、数字等格式化
 */

/**
 * 格式化日期
 * @param {number} timestamp - 时间戳
 * @returns {string} 格式化后的日期字符串 (MM/DD)
 */
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * 格式化完整日期
 * @param {number} timestamp - 时间戳
 * @returns {string} 格式化后的日期字符串 (YYYY-MM-DD)
 */
function formatFullDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 格式化相对时间
 * @param {number} timestamp - 时间戳
 * @returns {string} 相对时间描述 (如：3 天前)
 */
function formatRelativeTime(timestamp) {
  if (!timestamp) return '';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  
  return formatFullDate(timestamp);
}

/**
 * 格式化数字 (添加千分位)
 * @param {number} num - 数字
 * @returns {string} 格式化后的数字字符串
 */
function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * 格式化分数
 * @param {number} score - 分数
 * @returns {string} 格式化后的分数字符串
 */
function formatScore(score) {
  if (score === null || score === undefined) return '0';
  return Math.round(score).toString();
}

module.exports = {
  formatDate,
  formatFullDate,
  formatRelativeTime,
  formatNumber,
  formatScore
};
