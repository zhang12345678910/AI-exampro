/**
 * 拼音转换工具
 * 支持中文转拼音、拼音首字母匹配
 */

// 常用汉字拼音映射表 (简化版，覆盖常用 AI 术语汉字)
const PINYIN_MAP = {
  // 基础常用字
  '机': 'ji', '器': 'qi', '学': 'xue', '习': 'xi',
  '人': 'ren', '工': 'gong', '智': 'zhi', '能': 'neng',
  '深': 'shen', '度': 'du', '神': 'shen', '经': 'jing',
  '网': 'wang', '络': 'luo', '数': 'shu', '据': 'ju',
  '模': 'mo', '型': 'xing', '算': 'suan', '法': 'fa',
  '语': 'yu', '言': 'yan', '处': 'chu', '理': 'li',
  '识': 'shi', '别': 'bie', '图': 'tu', '像': 'xiang',
  '视': 'shi', '频': 'pin', '音': 'yin', '频': 'pin',
  '推': 'tui', '荐': 'jian', '系': 'xi', '统': 'tong',
  '自': 'zi', '然': 'ran', '理': 'li', '解': 'jie',
  '生': 'sheng', '成': 'cheng', '式': 'shi', '预': 'yu',
  '训': 'xun', '练': 'lian', '参': 'can', '数': 'shu',
  '特': 'te', '征': 'zheng', '向': 'xiang', '量': 'liang',
  '分': 'fen', '类': 'lei', '聚': 'ju', '回': 'hui',
  '归': 'gui', '策': 'ce', '略': 'lue', '强': 'qiang',
  '化': 'hua', '样': 'yang', '本': 'ben', '标': 'biao',
  '签': 'qian', '损': 'sun', '失': 'shi', '函': 'han',
  '梯': 'ti', '度': 'du', '下': 'xia', '降': 'jiang',
  '迭': 'die', '代': 'dai', '批': 'pi', '量': 'liang',
  '随': 'sui', '机': 'ji', '抽': 'chou', '样': 'yang',
  '过': 'guo', '拟': 'ni', '合': 'he', '正': 'zheng',
  '则': 'ze', '项': 'xiang', '激': 'ji', '活': 'huo',
  '卷': 'juan', '积': 'ji', '池': 'chi', '化': 'hua',
  '全': 'quan', '连': 'lian', '接': 'jie', '嵌': 'qian',
  '入': 'ru', '编': 'bian', '码': 'ma', '解': 'jie',
  '译': 'yi', '注': 'zhu', '意': 'yi', '力': 'li',
  '机': 'ji', '制': 'zhi', '变': 'bian', '换': 'huan',
  '器': 'qi', '生': 'sheng', '成': 'cheng', '对': 'dui',
  '抗': 'kang', '迁': 'qian', '移': 'yi', '学': 'xue',
  '少': 'shao', '样': 'yang', '零': 'ling', '射': 'she',
  '监': 'jian', '督': 'du', '无': 'wu', '监': 'jian',
  '半': 'ban', '自': 'zi', '元': 'yuan', '增': 'zeng',
  '强': 'qiang', '回': 'hui', '馈': 'kui', '环': 'huan',
  '境': 'jing', '状': 'zhuang', '态': 'tai', '动': 'dong',
  '作': 'zuo', '奖': 'jiang', '励': 'li', '值': 'zhi',
  '函': 'han', '数': 'shu', '策': 'ce', '略': 'lue',
  '模': 'mo', '型': 'xing', '环': 'huan', '境': 'jing',
  '大': 'da', '语': 'yu', '言': 'yan', '模': 'mo',
  '型': 'xing', '变': 'bian', '换': 'huan', '器': 'qi',
  '架': 'jia', '构': 'gou', '编': 'bian', '码': 'ma',
  '器': 'qi', '解': 'jie', '码': 'ma', '器': 'qi',
  '词': 'ci', '向': 'xiang', '量': 'liang', '表': 'biao',
  '示': 'shi', '词': 'ci', '嵌': 'qian', '入': 'ru',
  '字': 'zi', '词': 'ci', '子': 'zi', '标': 'biao',
  '记': 'ji', '化': 'hua', '分': 'fen', '词': 'ci',
  '词': 'ci', '性': 'xing', '标': 'biao', '注': 'zhu',
  '命': 'ming', '名': 'ming', '实': 'shi', '体': 'ti',
  '识': 'shi', '别': 'bie', '关': 'guan', '系': 'xi',
  '抽': 'chou', '取': 'qu', '问': 'wen', '答': 'da',
  '系': 'xi', '统': 'tong', '对': 'dui', '话': 'hua',
  '系': 'xi', '统': 'tong', '聊': 'liao', '天': 'tian',
  '机': 'ji', '器': 'qi', '人': 'ren', '文': 'wen',
  '本': 'ben', '分': 'fen', '析': 'xi', '情': 'qing',
  '感': 'gan', '分': 'fen', '析': 'xi', '文': 'wen',
  '档': 'dang', '摘': 'zhai', '要': 'yao', '关': 'guan',
  '键': 'jian', '词': 'ci', '提': 'ti', '取': 'qu',
  '文': 'wen', '档': 'dang', '聚': 'ju', '类': 'lei',
  '主': 'zhu', '题': 'ti', '模': 'mo', '型': 'xing',
  '隐': 'yin', '狄': 'di', '利': 'li', '雷': 'lei',
  '回': 'hui', '归': 'gui', '逻': 'luo', '辑': 'ji',
  '决': 'jue', '策': 'ce', '树': 'shu', '随': 'sui',
  '机': 'ji', '森': 'sen', '林': 'lin', '梯': 'ti',
  '度': 'du', '提': 'ti', '升': 'sheng', '支': 'zhi',
  '持': 'chi', '向': 'xiang', '量': 'liang', '机': 'ji',
  '贝': 'bei', '叶': 'ye', '斯': 'si', '朴': 'pu',
  '素': 'su', '模': 'mo', '型': 'xing', '条': 'tiao',
  '件': 'jian', '随': 'sui', '机': 'ji', '场': 'chang',
  '隐': 'yin', '马': 'ma', '尔': 'er', '可': 'ke',
  '夫': 'fu', '模': 'mo', '型': 'xing', '卡': 'ka',
  '尔': 'er', '曼': 'man', '滤': 'lv', '波': 'bo',
  '粒': 'li', '子': 'zi', '滤': 'lv', '波': 'bo',
  '自': 'zi', '适': 'shi', '应': 'ying', '共': 'gong',
  '振': 'zhen', '自': 'zi', '组': 'zu', '织': 'zhi',
  '映': 'ying', '射': 'she', '竞': 'jing', '争': 'zheng',
  '神': 'shen', '经': 'jing', '网': 'wang', '络': 'luo',
  '感': 'gan', '知': 'zhi', '机': 'ji', '器': 'qi',
  '计': 'ji', '算': 'suan', '机': 'ji', '视': 'shi',
  '觉': 'jue', '自': 'zi', '动': 'dong', '驾': 'jia',
  '驶': 'shi', '智': 'zhi', '慧': 'hui', '城': 'cheng',
  '市': 'shi', '智': 'zhi', '慧': 'hui', '医': 'yi',
  '疗': 'liao', '智': 'zhi', '慧': 'hui', '金': 'jin',
  '融': 'rong', '智': 'zhi', '慧': 'hui', '教': 'jiao',
  '育': 'yu', '智': 'zhi', '慧': 'hui', '零': 'ling',
  '售': 'shou', '智': 'zhi', '慧': 'hui', '制': 'zhi',
  '造': 'zao', '智': 'zhi', '慧': 'hui', '农': 'nong',
  '业': 'ye', '智': 'zhi', '慧': 'hui', '物': 'wu',
  '流': 'liu', '智': 'zhi', '慧': 'hui', '家': 'jia',
  '居': 'ju', '智': 'zhi', '慧': 'hui', '城': 'cheng',
  '市': 'shi', '智': 'zhi', '慧': 'hui', '政': 'zheng',
  '务': 'wu', '智': 'zhi', '慧': 'hui', '环': 'huan',
  '保': 'bao', '智': 'zhi', '慧': 'hui', '能': 'neng',
  '源': 'yuan', '智': 'zhi', '慧': 'hui', '交': 'jiao',
  '通': 'tong', '智': 'zhi', '慧': 'hui', '旅': 'lv',
  '游': 'you', '智': 'zhi', '慧': 'hui', '健': 'jian',
  '康': 'kang', '智': 'zhi', '慧': 'hui', '体': 'ti',
  '育': 'yu', '智': 'zhi', '慧': 'hui', '娱': 'yu',
  '乐': 'le', '智': 'zhi', '慧': 'hui', '媒': 'mei',
  '体': 'ti', '智': 'zhi', '慧': 'hui', '广': 'guang',
  '告': 'gao', '智': 'zhi', '慧': 'hui', '营': 'ying',
  '销': 'xiao', '智': 'zhi', '慧': 'hui', '客': 'ke',
  '服': 'fu', '智': 'zhi', '慧': 'hui', '销': 'xiao',
  '售': 'shou', '智': 'zhi', '慧': 'hui', '采': 'cai',
  '购': 'gou', '智': 'zhi', '慧': 'hui', '供': 'gong',
  '应': 'ying', '链': 'lian', '智': 'zhi', '慧': 'hui',
  '仓': 'cang', '储': 'chu', '智': 'zhi', '慧': 'hui',
  '配': 'pei', '送': 'song', '智': 'zhi', '慧': 'hui',
  '包': 'bao', '装': 'zhuang', '智': 'zhi', '慧': 'hui',
  '检': 'jian', '测': 'ce', '智': 'zhi', '慧': 'hui',
  '质': 'zhi', '控': 'kong', '智': 'zhi', '慧': 'hui',
  '维': 'wei', '护': 'hu', '智': 'zhi', '慧': 'hui',
  '安': 'an', '防': 'fang', '智': 'zhi', '慧': 'hui',
  '消': 'xiao', '防': 'fang', '智': 'zhi', '慧': 'hui',
  '应': 'ying', '急': 'ji', '智': 'zhi', '慧': 'hui',
  '救': 'jiu', '援': 'yuan', '智': 'zhi', '慧': 'hui',
  '消': 'xiao', '费': 'fei', '智': 'zhi', '慧': 'hui',
  '支': 'zhi', '付': 'fu', '智': 'zhi', '慧': 'hui',
  '保': 'bao', '险': 'xian', '智': 'zhi', '慧': 'hui',
  '银': 'yin', '行': 'hang', '智': 'zhi', '慧': 'hui',
  '证': 'zheng', '券': 'quan', '智': 'zhi', '慧': 'hui',
  '基': 'ji', '金': 'jin', '智': 'zhi', '慧': 'hui',
  '期': 'qi', '货': 'huo', '智': 'zhi', '慧': 'hui',
  '信': 'xin', '贷': 'dai', '智': 'zhi', '慧': 'hui',
  '风': 'feng', '控': 'kong', '智': 'zhi', '慧': 'hui',
  '审': 'shen', '计': 'ji', '智': 'zhi', '慧': 'hui',
  '税': 'shui', '务': 'wu', '智': 'zhi', '慧': 'hui',
  '会': 'hui', '计': 'ji', '智': 'zhi', '慧': 'hui',
  '法': 'fa', '律': 'lv', '智': 'zhi', '慧': 'hui',
  '司': 'si', '法': 'fa', '智': 'zhi', '慧': 'hui',
  '公': 'gong', '证': 'zheng', '智': 'zhi', '慧': 'hui',
  '仲': 'zhong', '裁': 'cai', '智': 'zhi', '慧': 'hui',
  '知': 'zhi', '识': 'shi', '产': 'chan', '权': 'quan',
  '专': 'zhuan', '利': 'li', '商': 'shang', '标': 'biao',
  '版': 'ban', '权': 'quan', '著': 'zhu', '作': 'zuo',
  '权': 'quan', '商': 'shang', '标': 'biao', '权': 'quan',
  '专': 'zhuan', '利': 'li', '权': 'quan', '著': 'zhu',
  '作': 'zuo', '权': 'quan', '商': 'shang', '标': 'biao'
};

/**
 * 将中文转换为拼音
 * @param {string} text - 中文文本
 * @returns {string} 拼音字符串
 */
function toPinyin(text) {
  if (!text) return '';
  
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const pinyin = PINYIN_MAP[char];
    
    if (pinyin) {
      result += pinyin;
    } else {
      // 未知字符，保留原字符
      result += char;
    }
  }
  
  return result;
}

/**
 * 获取拼音首字母
 * @param {string} text - 中文文本
 * @returns {string} 拼音首字母大写
 */
function toPinyinInitials(text) {
  if (!text) return '';
  
  const pinyin = toPinyin(text);
  let initials = '';
  
  // 提取每个拼音的首字母
  const parts = pinyin.split(/[^a-z]/i);
  for (const part of parts) {
    if (part && part.length > 0) {
      initials += part.charAt(0).toUpperCase();
    }
  }
  
  return initials || text.charAt(0).toUpperCase();
}

/**
 * 检查文本是否匹配搜索词 (支持拼音匹配)
 * @param {string} text - 待搜索文本
 * @param {string} query - 搜索词
 * @param {string} mode - 搜索模式：keyword, pinyin, initial
 * @returns {boolean} 是否匹配
 */
function matchesSearch(text, query, mode = 'keyword') {
  if (!text || !query) return false;
  
  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  
  if (mode === 'keyword') {
    // 关键词匹配 (中文/英文)
    return lowerText.includes(lowerQuery);
  } else if (mode === 'pinyin') {
    // 拼音匹配
    const pinyin = toPinyin(text);
    return pinyin.toLowerCase().includes(lowerQuery);
  } else if (mode === 'initial') {
    // 首字母匹配
    const initials = toPinyinInitials(text);
    return initials.toLowerCase().includes(lowerQuery);
  }
  
  return false;
}

/**
 * 对术语列表进行拼音排序
 * @param {Array} list - 术语列表
 * @returns {Array} 排序后的列表
 */
function sortByPinyin(list) {
  return list.sort((a, b) => {
    const pinyinA = toPinyin(a.name || '');
    const pinyinB = toPinyin(b.name || '');
    return pinyinA.localeCompare(pinyinB);
  });
}

/**
 * 按首字母分组
 * @param {Array} list - 术语列表
 * @returns {Object} 按字母分组的对象
 */
function groupByInitial(list) {
  const groups = {};
  
  list.forEach(item => {
    const initial = toPinyinInitials(item.name || '') || 'OTHER';
    if (!groups[initial]) {
      groups[initial] = [];
    }
    groups[initial].push(item);
  });
  
  return groups;
}

module.exports = {
  toPinyin,
  toPinyinInitials,
  matchesSearch,
  sortByPinyin,
  groupByInitial,
  PINYIN_MAP
};
