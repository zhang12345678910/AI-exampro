// 转换 JSON 数组为 JSON Lines 格式
const fs = require('fs');
const path = require('path');

const dataDir = '/home/admin/.openclaw/workspace/projects/ai-terms-miniprogram/data';

// 需要转换的文件
const files = [
  'terms_extended.json',
  'categories.json',
  'badges.json',
  'quiz_questions.json'
];

files.forEach(file => {
  const inputPath = path.join(dataDir, file);
  const outputPath = path.join(dataDir, file.replace('.json', '_lines.json'));
  
  try {
    // 读取 JSON 数组
    const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    
    // 转换为 JSON Lines (每行一个 JSON 对象)
    const lines = data.map(item => JSON.stringify(item)).join('\n');
    
    // 写入文件
    fs.writeFileSync(outputPath, lines, 'utf8');
    
    console.log(`✅ 转换成功：${file}`);
    console.log(`   输出文件：${file.replace('.json', '_lines.json')}`);
    console.log(`   数据量：${data.length} 条\n`);
  } catch (err) {
    console.error(`❌ 转换失败：${file}`);
    console.error(`   错误：${err.message}\n`);
  }
});

console.log('所有文件转换完成！');
console.log('\n导入说明:');
console.log('1. 打开微信开发者工具 → 云开发控制台 → 数据库');
console.log('2. 创建对应集合 (terms, categories, badges, quiz_questions)');
console.log('3. 点击「导入」→ 选择对应的 _lines.json 文件');
console.log('4. 导入完成后验证数据量');
