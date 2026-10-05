'use client'

import { getNextLunarNewYear } from '../utils/lunarNewYear';
import { Countdown } from '../components/countdown';
import { AudioPlayer } from '../components/AudioPlayer';
import { SparklesIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

const BACKGROUND_SWITCH_INTERVAL_MS = 5 * 60 * 1000;
const BACKGROUND_SOURCE_TIMEOUT_MS = 10 * 1000; // 单个背景图源加载超时
const BACKGROUND_RETRY_DELAYS_MS = [1000, 3000];
// 本地兜底图（已压缩至 ~94KB，网络波动时兜底显示，不会拖慢首屏）
const FALLBACK_BACKGROUND_URL = '/old/img/bj.jpg';

/**
 * 背景图 API 源（仅自建 Bing 壁纸接口）。
 * 说明：接口返回 302 到壁纸图片，用 <img> 加载，无 CORS 限制。
 * 若接口不可用，回退到本地压缩兜底图（~94KB，不拖慢首屏）。
 */
const getRandomBackgroundUrl = async (): Promise<string | null> => {
  const cacheBust = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const response = await fetch(`/api/bg?json=1&_ts=${cacheBust}`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(BACKGROUND_SOURCE_TIMEOUT_MS),
  });
  if (!response.ok) {
    return null;
  }

  const data: { url?: unknown } = await response.json();
  if (typeof data.url !== 'string' || !data.url) {
    return null;
  }

  const imageUrl = new URL(data.url, window.location.origin).toString();
  return new Promise((resolve) => {
    const image = new Image();
    image.referrerPolicy = 'no-referrer';
    let settled = false;
    const timeoutId = setTimeout(() => {
      if (settled) return;
      settled = true;
      image.onload = null;
      image.onerror = null;
      image.src = 'data:,';
      resolve(null);
    }, BACKGROUND_SOURCE_TIMEOUT_MS);

    image.onload = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve(imageUrl);
    };
    image.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      resolve(null);
    };
    image.src = imageUrl;
  });
};

const loadBackgroundWithRetry = async (
  shouldCancel: () => boolean
): Promise<string | null> => {
  for (let attempt = 0; attempt <= BACKGROUND_RETRY_DELAYS_MS.length; attempt += 1) {
    if (shouldCancel()) {
      return null;
    }
    let url: string | null = null;
    try {
      url = await getRandomBackgroundUrl();
    } catch {
      url = null;
    }
    if (url || shouldCancel()) {
      return url;
    }
    const retryDelay = BACKGROUND_RETRY_DELAYS_MS[attempt];
    if (retryDelay !== undefined) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }
  return null;
};

export default function Home() {
  const [nextLunarNewYear, setNextLunarNewYear] = useState(() => getNextLunarNewYear());
  const year = nextLunarNewYear.getFullYear();
  const currentYear = new Date().getFullYear();
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);
  const [musics, setMusics] = useState<{ title: string; url: string }[]>([]);

  useEffect(() => {
    const refreshTarget = () => setNextLunarNewYear(getNextLunarNewYear());
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshTarget();
      }
    };

    refreshTarget();
    const timer = setInterval(refreshTarget, 60 * 60 * 1000);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadBackground = async () => {
      const url = await loadBackgroundWithRetry(() => isCancelled);
      if (!isCancelled && url) {
        setBackgroundUrl(url);
      }
    };

    setBackgroundUrl(FALLBACK_BACKGROUND_URL);
    void loadBackground();
    const timer = setInterval(() => void loadBackground(), BACKGROUND_SWITCH_INTERVAL_MS);

    return () => {
      isCancelled = true;
      clearInterval(timer);
    };
  }, []);

  // 当前远程背景加载失败时，重新请求随机壁纸；失败后使用本地兜底图
  useEffect(() => {
    if (!backgroundUrl || backgroundUrl === FALLBACK_BACKGROUND_URL) {
      return;
    }
    let cancelled = false;
    const testImg = new Image();
    testImg.referrerPolicy = 'no-referrer';
    testImg.onerror = () => {
      if (cancelled) {
        return;
      }
      void loadBackgroundWithRetry(() => cancelled).then((url) => {
        if (!cancelled) {
          setBackgroundUrl(url ?? FALLBACK_BACKGROUND_URL);
        }
      });
    };
    testImg.src = backgroundUrl;
    return () => {
      cancelled = true;
      testImg.onerror = null;
    };
  }, [backgroundUrl]);

  useEffect(() => {
    document.title = `${year}年春节倒计时 - 新年快乐`;
  }, [year]);

  // 动态获取音乐列表（从 /api/music，清单在 S3 上可随时修改）
  useEffect(() => {
    fetch('/api/music')
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.musics) && data.musics.length > 0) {
          setMusics(data.musics);
        }
      })
      .catch(() => {
        // 获取失败保持空，不渲染播放器
      });
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image（远程背景尚未加载时显示本地兜底图） */}
      <div 
        className="absolute inset-0 bg-slate-900 bg-cover bg-center bg-no-repeat animate-ken-burns"
        style={{ 
          backgroundImage: backgroundUrl ? `url("${backgroundUrl}")` : undefined,
        }}
      />
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <SparklesIcon className="text-yellow-300 animate-pulse mb-4" size={48} />
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 text-center drop-shadow-lg animate-fade-in">
          <span className="inline-block animate-float">{year}</span>年春节倒计时
        </h1>
        <div className="animate-slide-up">
          <Countdown targetDate={nextLunarNewYear} />
        </div>
        <p className="mt-8 text-xl text-white/90 font-medium animate-fade-in animate-pulse">
          下一个春节日期: {nextLunarNewYear.toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-4 left-4 text-red-500 animate-float">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
          <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
          <path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="fixed bottom-4 right-4 z-20 w-96 max-w-[calc(100vw-2rem)] rounded-lg bg-white/10 p-4 text-right text-sm text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white/20">
        <p>Copyright © 2018-{currentYear} Yuban-Network。</p>
        <p>
          感谢
          <a
            href="https://github.com/ssdomei232"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-1 text-cyan-300 underline-offset-2 hover:underline"
          >
            ssdomei232
          </a>
          提供的部分代码。
        </p>
        <p>
          本站云计算服务由
          <a
            href="https://www.rainyun.com/YuBan_"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-1 text-cyan-300 underline-offset-2 hover:underline"
          >
            雨云
          </a>
          提供。
        </p>
      </div>
      {/* Audio Player（歌单动态加载，列表为空时不渲染） */}
      {musics.length > 0 && <AudioPlayer playlist={musics} />}
    </div>
  );
}
