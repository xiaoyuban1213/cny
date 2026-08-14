import { NextRequest, NextResponse } from 'next/server';

// 壁纸文件名（与 api/wallpapers.json 一致；可用 WALLPAPER_NAMES 环境变量覆盖）
const DEFAULT_WALLPAPER_FILES = [
  '20260814.jpg',
  '20260813.jpg',
  '20260812.jpg',
  '20260811.jpg',
  '20260810.jpg',
  '20260809.jpg',
  '20260808.jpg',
  '20260807.jpg',
  '20260814-2.jpg',
  '20260813-2.jpg',
  '20260810-2.jpg',
  '20260807-2.jpg',
  '20260813-3.jpg',
  '20260807-3.jpg',
  '20260814-3.jpg',
  '20260810-3.jpg',
];

// 每次请求动态执行（随机选择），避免被静态优化成固定结果
export const dynamic = 'force-dynamic';

function getWallpapers(): string[] {
  const names = (process.env.WALLPAPER_NAMES || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return names.length > 0 ? names : DEFAULT_WALLPAPER_FILES;
}

export async function GET(request: NextRequest) {
  const base = (process.env.WALLPAPER_BASE_URL || '').replace(/\/+$/, '');
  const wallpapers = getWallpapers();
  const { searchParams } = new URL(request.url);

  // 壁纸清单
  if (searchParams.get('list') === '1') {
    return NextResponse.json({ count: wallpapers.length, baseUrl: base, wallpapers });
  }

  // 未配置任何壁纸
  if (wallpapers.length === 0) {
    return NextResponse.json({ error: 'no wallpaper configured' }, { status: 503 });
  }

  const file = wallpapers[Math.floor(Math.random() * wallpapers.length)];
  const imgUrl = base ? `${base}/${file}` : `/wallpapers/${file}`;

  // JSON 模式
  if (searchParams.get('json') === '1') {
    return NextResponse.json({ url: imgUrl, file });
  }

  // 默认：302 重定向到随机壁纸（前端 <img> 直接可用）
  return new Response(null, {
    status: 302,
    headers: {
      Location: imgUrl,
      'Cache-Control': 'no-store',
    },
  });
}
