#!/usr/bin/env node
/**
 * Bing 壁纸下载脚本（一次性批量拉取，无需每天更新）
 *
 * 数据源：Bing 官方每日壁纸 API（免费、无需鉴权）
 *   必须用 global.bing.com 域名，mkt 参数才生效（cn.bing.com 会忽略 mkt）
 *   https://global.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US
 *
 * 通过多个市场（mkt）拉取更多不同壁纸，按图片主题（OHR.*）去重。
 *
 * 用法：
 *   node api/download.js              # 默认 1920x1080，6 个市场 x 最近 8 天，去重
 *   node api/download.js --uhd        # 下载 UHD 4K（体积大，单张约 3~4 MB）
 *   node api/download.js --days 3     # 每个市场只拉最近 3 天
 *
 * 产物：
 *   api/wallpapers/YYYYMMDD.jpg    壁纸图片（同一天多张时加 -2/-3 后缀）
 *   api/wallpapers.json            壁纸清单
 *
 * 壁纸下载到本地 api/wallpapers/，请上传到你的 S3/COS 对象存储，
 * 然后在 EdgeOne Pages 环境变量配置 WALLPAPER_BASE_URL（对象存储 CDN 域名）。
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const BING_API = 'https://global.bing.com/HPImageArchive.aspx';
const BING_IMG = 'https://cn.bing.com';
// 壁纸下载到本地 api/wallpapers/（已 gitignore），之后上传对象存储
const OUT_DIR = path.join(__dirname, 'wallpapers');
const MANIFEST_PATH = path.join(__dirname, 'wallpapers.json');

// 多个市场可拿到不同壁纸（有重叠，脚本按图片主题去重）
const MARKETS = ['en-US', 'ja-JP', 'de-DE', 'zh-CN', 'fr-FR', 'ko-KR'];

// 命令行参数
const args = process.argv.slice(2);
const useUhd = args.includes('--uhd');
const daysIdx = args.indexOf('--days');
const DAYS_PER_MARKET = Math.min(
  Math.max(parseInt(daysIdx >= 0 ? args[daysIdx + 1] : '8', 10) || 8, 1),
  8
);

/** 提取图片主题（OHR.xxx）作为去重 key：同一张图在不同市场的 URL 不同 */
function dedupKey(imageUrl) {
  const m = imageUrl.match(/OHR\.[A-Za-z0-9]+/);
  return m ? m[0] : imageUrl;
}

/** 简单 HTTP GET（跟随重定向，返回 Buffer） */
function get(url, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          res.resume();
          if (redirectsLeft <= 0) {
            reject(new Error(`重定向次数过多: ${url}`));
            return;
          }
          const next = new URL(res.headers.location, url).toString();
          resolve(get(next, redirectsLeft - 1));
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      })
      .on('error', reject);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 下载单张图片：--uhd 时用 4K，失败回退 1920x1080 */
async function downloadImage(image) {
  const candidates = [];
  if (useUhd && image.url.includes('_1920x1080')) {
    candidates.push(image.url.replace('_1920x1080', '_UHD'));
  }
  candidates.push(image.url);
  for (const p of candidates) {
    try {
      return await get(`${BING_IMG}${p}`);
    } catch (e) {
      console.log(`    图源失败(${path.basename(p)}): ${e.message}`);
    }
  }
  throw new Error('图片下载失败');
}

/** 生成不冲突的文件名：20260814.jpg / 20260814-2.jpg ... */
function uniqueFile(date, existing) {
  let file = `${date}.jpg`;
  let n = 2;
  while (existing.has(file) || fs.existsSync(path.join(OUT_DIR, file))) {
    file = `${date}-${n}.jpg`;
    n += 1;
  }
  existing.add(file);
  return file;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const wallpapers = [];
  const seenKeys = new Set(); // 按图片主题去重（同一张图只留一份）
  const usedFiles = new Set();
  let downloaded = 0;
  let skipped = 0;

  console.log(
    `开始拉取 ${MARKETS.length} 个市场 x 最近 ${DAYS_PER_MARKET} 天 Bing 壁纸（${useUhd ? 'UHD 4K' : '1920x1080'}）...\n`
  );

  for (const mkt of MARKETS) {
    for (let idx = 0; idx < DAYS_PER_MARKET; idx += 1) {
      const apiUrl = `${BING_API}?format=js&idx=${idx}&n=1&mkt=${mkt}`;
      try {
        const buf = await get(apiUrl);
        const data = JSON.parse(buf.toString('utf-8'));
        const image = data.images && data.images[0];
        if (!image || !image.startdate) {
          continue;
        }
        // 同一张图只下载一次（按主题去重）
        const key = dedupKey(image.url);
        if (seenKeys.has(key)) {
          skipped += 1;
          continue;
        }
        seenKeys.add(key);

        const date = image.startdate; // YYYYMMDD
        const file = uniqueFile(date, usedFiles);
        const outPath = path.join(OUT_DIR, file);
        const imgBuf = await downloadImage(image);
        fs.writeFileSync(outPath, imgBuf);
        const sizeMB = (imgBuf.length / 1024 / 1024).toFixed(2);
        console.log(`[${mkt}][idx=${idx}] ${file} (${sizeMB} MB)`);
        downloaded += 1;
        wallpapers.push({ file, title: image.copyright || '', date, market: mkt });
      } catch (e) {
        console.log(`[${mkt}][idx=${idx}] 失败: ${e.message}`);
      }
      await sleep(300); // 控制请求频率，避免被限流
    }
  }

  // 生成清单
  const manifest = {
    updatedAt: new Date().toISOString(),
    source: 'https://global.bing.com/HPImageArchive.aspx',
    baseUrl: 'https://<your-cos-cdn-domain>', // TODO: 改为对象存储 CDN 域名（可选）
    wallpapers,
  };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log('\n完成！');
  console.log(`  新增 ${downloaded} 张，跳过重复 ${skipped} 张，共 ${wallpapers.length} 张。`);
  console.log(`  图片目录: ${OUT_DIR}`);
  console.log(`  清单文件: ${MANIFEST_PATH}`);
  console.log('\n下一步：');
  console.log(`  1. 将 ${OUT_DIR} 上传到你的 S3/COS 对象存储`);
  console.log('  2. 在 EdgeOne Pages 环境变量配置 WALLPAPER_BASE_URL = 对象存储 CDN 域名');
  console.log('  3. 前端背景图源换成 https://你的站点/api/bg');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

