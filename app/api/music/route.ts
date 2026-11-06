import { NextResponse } from 'next/server';

// 每次请求动态执行（manifest 可能变化）
export const dynamic = 'force-dynamic';

// 默认音乐列表（S3 manifest.json 拉取失败时的兜底）
const DEFAULT_MUSICS = [
  { title: '恭喜发财', file: '恭喜发财.mp3' },
  { title: '好运来', file: '好运来.mp3' },
  { title: '好日子', file: '好日子.mp3' },
  { title: '春节序曲', file: '春节序曲.mp3' },
  { title: '发财发福中国年', file: '发财发福中国年.mp3' },
  { title: '财神到', file: '财神到.mp3' },
  { title: '相亲相爱', file: '相亲相爱.mp3' },
  { title: '触摸天空', file: '触摸天空.mp3' },
];

/**
 * 站点域名，用于构造对象存储防盗链所需的 Referer。
 * 对象存储开启了域名白名单防盗链且不允许空 Referer，
 * 服务端 fetch 默认不带 Referer 会被 403，必须显式补上。
 */
const SITE_ORIGIN =
  (process.env.SITE_ORIGIN || '').replace(/\/+$/, '') || 'https://cny.yuban.cloud';

/**
 * 计算音乐目录基础 URL：
 * 优先用环境变量 MUSIC_BASE_URL；未配置时从 WALLPAPER_BASE_URL 推导
 * （https://xxx/wallpapers -> https://xxx/music）
 */
function getMusicBase(): string {
  const custom = (process.env.MUSIC_BASE_URL || '').replace(/\/+$/, '');
  if (custom) {
    return custom;
  }
  const wallBase = (process.env.WALLPAPER_BASE_URL || '').replace(/\/+$/, '');
  return wallBase.replace(/\/wallpapers$/, '') + '/music';
}

export async function GET() {
  const base = getMusicBase();

  // 从对象存储拉取 manifest.json（服务端请求，无 CORS 限制）
  // 你可以在 S3 的 music/ 目录里直接编辑 manifest.json 来增删歌曲，无需改代码
  let musics = DEFAULT_MUSICS;
  try {
    const res = await fetch(`${base}/manifest.json`, {
      signal: AbortSignal.timeout(6000),
      headers: {
        Accept: 'application/json',
        // 防盗链按 Referer 白名单放行，服务端请求必须显式携带
        Referer: `${SITE_ORIGIN}/`,
      },
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.musics) && data.musics.length > 0) {
        musics = data.musics;
      }
    }
  } catch {
    // manifest 拉取失败，回退默认列表
  }

  const list = musics
    .filter((m) => m && typeof m.file === 'string' && m.file)
    .map((m) => ({
      title: m.title || m.file,
      url: `${base}/${encodeURI(m.file)}`,
    }));

  return NextResponse.json(
    { count: list.length, baseUrl: base, musics: list },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
