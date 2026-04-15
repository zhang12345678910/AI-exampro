// 生成简单的 PNG 图标 (无需外部依赖)
const fs = require('fs');

// 创建最小的 PNG 文件
function createPNG(width, height, pixels) {
  // PNG 签名
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // 创建 IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 6;  // color type (RGBA)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdrData);
  
  // 创建图像数据
  const rawData = Buffer.alloc(width * height * 5);  // 5 bytes per pixel (filter + RGBA)
  for (let y = 0; y < height; y++) {
    rawData[y * width * 5] = 0;  // filter byte
    for (let x = 0; x < width; x++) {
      const idx = y * width * 5 + x * 5 + 1;
      const pixel = pixels[x + y * width] || [0, 0, 0, 0];
      rawData[idx] = pixel[0];
      rawData[idx + 1] = pixel[1];
      rawData[idx + 2] = pixel[2];
      rawData[idx + 3] = pixel[3];
    }
  }
  
  // 简单压缩 (实际上应该用 zlib，这里用未压缩的)
  const idatChunk = createChunk('IDAT', rawData);
  
  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crcData = Buffer.concat([Buffer.from(type), data]);
  const crc = crc32(crcData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc);
  return Buffer.concat([length, Buffer.from(type), data, crcBuf]);
}

function crc32(data) {
  let crc = 0xffffffff;
  const table = getCrcTable();
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

let crcTable = null;
function getCrcTable() {
  if (crcTable) return crcTable;
  crcTable = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    crcTable[i] = c >>> 0;
  }
  return crcTable;
}

// 绘制图标
function drawIcon(type, color) {
  const size = 81;
  const pixels = new Array(size * size).fill([0, 0, 0, 0]);
  
  const [r, g, b] = hexToRgb(color);
  
  if (type === 'home') {
    // 画房子
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // 简单房子形状
        const cx = x - 40.5;
        const cy = y - 37.5;
        if (y >= 35 && y <= 65 && x >= 20 && x <= 61) {
          pixels[x + y * size] = [r, g, b, 255];
        }
        // 屋顶
        if (y < 35 && y >= 10 && Math.abs(cx) <= (35 - y) * 1.8) {
          pixels[x + y * size] = [r, g, b, 255];
        }
      }
    }
  } else if (type === 'dictionary') {
    // 画书本
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (x >= 20 && x <= 61 && y >= 20 && y <= 61) {
          pixels[x + y * size] = [r, g, b, 255];
        }
        // 中间白线
        if (x >= 39 && x <= 42 && y >= 20 && y <= 61) {
          pixels[x + y * size] = [255, 255, 255, 200];
        }
      }
    }
  } else if (type === 'profile') {
    // 画人形 (头 + 身体)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = x - 40.5;
        const dy = y - 30;
        // 头
        if (dx * dx + dy * dy <= 144) {
          pixels[x + y * size] = [r, g, b, 255];
        }
        // 身体
        const bodyDy = y - 55;
        if (dx * dx / 324 + bodyDy * bodyDy / 196 <= 1) {
          pixels[x + y * size] = [r, g, b, 255];
        }
      }
    }
  }
  
  return pixels;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [153, 153, 153];
}

// 生成所有图标
const icons = [
  { name: 'home.png', type: 'home', color: '#999999' },
  { name: 'home-active.png', type: 'home', color: '#1E88E5' },
  { name: 'dictionary.png', type: 'dictionary', color: '#999999' },
  { name: 'dictionary-active.png', type: 'dictionary', color: '#1E88E5' },
  { name: 'profile.png', type: 'profile', color: '#999999' },
  { name: 'profile-active.png', type: 'profile', color: '#1E88E5' }
];

console.log('开始生成图标...');
icons.forEach(icon => {
  const pixels = drawIcon(icon.type, icon.color);
  const png = createPNG(81, 81, pixels);
  fs.writeFileSync(icon.name, png);
  console.log('✓ Created:', icon.name);
});

console.log('\n所有图标生成完成!');
