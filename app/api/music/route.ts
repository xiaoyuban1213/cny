import { NextResponse } from 'next/server';

// 每次请求动态执行（manifest 可能变化）
export const dynamic = 'force-dynamic';

// 默认音乐列表（S3 manifest.json 拉取失败时的兜底）
const DEFAULT_MUSICS = [
  { title: '恭喜发财', file: '恭喜发财.mp3' },
  { title: '好运来', file: '好运来.mp3' },
  { title: '好日子', file: '好日子.mp3' },
  { title: '相亲相爱', file: '相亲相爱.mp3' },
  { title: '触摸天空', file: '触摸天空.mp3' },
];

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
      headers: { Accept: 'application/json' },
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
