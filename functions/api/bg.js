/**
 * EdgeOne Pages Function — 随机必应壁纸 API
 *
 * 路由：/api/bg
 *   GET /api/bg         -> 302 重定向到随机壁纸（适合 <img> 直接加载）
 *   GET /api/bg?json=1  -> JSON { url, title, date }
 *   GET /api/bg?list=1  -> JSON 壁纸清单
 *
 * 主要配置（在 EdgeOne Pages 控制台设置环境变量）：
 *   WALLPAPER_BASE_URL  对象存储中壁纸所在文件夹的地址（含路径），
 *                       如 https://api-yuban.cn-nb1.rains3.com/wallpapers（必填）
 *                       需开启公共读，本函数返回该地址下的随机图片
 *   WALLPAPER_NAMES     壁纸文件名，逗号分隔，如 20260814.jpg,20260813.jpg
 *                       未配置时使用下方 DEFAULT_WALLPAPERS
 *
 * 目录约定（EdgeOne Pages Functions，兼容 Cloudflare Pages Functions）：
 *   functions/api/bg.js  =>  /api/bg
 */

// 默认壁纸清单（由 api/download.js 生成后同步到此；也可用 WALLPAPER_NAMES 环境变量覆盖）
const DEFAULT_WALLPAPERS = [
  { file: '20260814.jpg', date: '20260814' },
  { file: '20260813.jpg', date: '20260813' },
  { file: '20260812.jpg', date: '20260812' },
  { file: '20260811.jpg', date: '20260811' },
  { file: '20260810.jpg', date: '20260810' },
  { file: '20260809.jpg', date: '20260809' },
  { file: '20260808.jpg', date: '20260808' },
  { file: '20260807.jpg', date: '20260807' },
  { file: '20260814-2.jpg', date: '20260814' },
  { file: '20260813-2.jpg', date: '20260813' },
  { file: '20260810-2.jpg', date: '20260810' },
  { file: '20260807-2.jpg', date: '20260807' },
  { file: '20260813-3.jpg', date: '20260813' },
  { file: '20260807-3.jpg', date: '20260807' },
  { file: '20260814-3.jpg', date: '20260814' },
  { file: '20260810-3.jpg', date: '20260810' },
];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

function getWallpapers(env) {
  const names = (env.WALLPAPER_NAMES || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (names.length > 0) {
    return names.map((file) => ({
      file,
      title: '',
      date: file.replace(/\.jpg$/i, ''),
    }));
  }
  return DEFAULT_WALLPAPERS;
}

function pickWallpaper(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function buildImageUrl(env, file) {
  const base = (env.WALLPAPER_BASE_URL || '').replace(/\/+$/, '');
  if (base) {
    return `${base}/${file}`;
  }
  // 未配置 CDN 域名时，壁纸随仓库部署在 public/wallpapers/，返回同站相对路径
  return `/wallpapers/${file}`;
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const wallpapers = getWallpapers(env);
  const base = env.WALLPAPER_BASE_URL || '';

  // 清单
  if (url.searchParams.get('list') === '1') {
    return json({ count: wallpapers.length, baseUrl: base, wallpapers });
  }

  // 未配置任何壁纸
  if (wallpapers.length === 0) {
    return json({ error: 'no wallpaper configured' }, 503);
  }

  const item = pickWallpaper(wallpapers);
  const imgUrl = buildImageUrl(env, item.file);

  // JSON 模式
  if (url.searchParams.get('json') === '1') {
    return json({ url: imgUrl, title: item.title, date: item.date });
  }

  // 默认：302 重定向到随机壁纸
  return new Response(null, {
    status: 302,
    headers: {
      Location: imgUrl,
      'Cache-Control': 'no-store',
    },
  });
}

// 兼容所有请求方法
export async function onRequest(context) {
  return onRequestGet(context);
}
