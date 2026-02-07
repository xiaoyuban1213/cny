'use client'

import { getNextLunarNewYear } from '../utils/lunarNewYear';
import { Countdown } from '../components/countdown';
import { AudioPlayer } from '../components/AudioPlayer';
import { useDeviceType } from '../hooks/useDeviceType';
import { SparklesIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const playlist = [
  { title: "恭喜发财", url: "https://www.yuban.cloud/music/恭喜发财.mp3" },
  { title: "好运来", url: "https://www.yuban.cloud/music/好运来.flac" },
  { title: "好日子", url: "https://www.yuban.cloud/music/好日子.flac" },
  { title: "相亲相爱", url: "https://www.yuban.cloud/music/相亲相爱.mp3" },
  { title: "触摸天空", url: "https://www.yuban.cloud/music/触摸天空.flac" },
];

const BACKGROUND_SWITCH_INTERVAL_MS = 5 * 60 * 1000;
const BACKGROUND_PRELOAD_LEAD_MS = 5 * 1000;
const FALLBACK_BACKGROUND_URL = '/old/img/bj.jpg';

export default function Home() {
  const nextLunarNewYear = getNextLunarNewYear();
  const isPC = useDeviceType();
  const year = nextLunarNewYear.getFullYear();
  const currentYear = new Date().getFullYear();
  const [backgroundUrl, setBackgroundUrl] = useState(FALLBACK_BACKGROUND_URL);
  const preloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const switchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextBackgroundUrlRef = useRef<string | null>(null);
  const pendingImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const baseUrl = isPC ? 'https://bing.img.run/rand_uhd.php' : 'https://bing.img.run/rand_m.php';
    const preloadDelay = Math.max(0, BACKGROUND_SWITCH_INTERVAL_MS - BACKGROUND_PRELOAD_LEAD_MS);
    let isCancelled = false;

    const createSourceUrl = () => `${baseUrl}?_ts=${Date.now()}`;

    const clearTimers = () => {
      if (preloadTimerRef.current) {
        clearTimeout(preloadTimerRef.current);
        preloadTimerRef.current = null;
      }
      if (switchTimerRef.current) {
        clearTimeout(switchTimerRef.current);
        switchTimerRef.current = null;
      }
    };

    const resetPendingImage = () => {
      if (!pendingImageRef.current) {
        return;
      }
      pendingImageRef.current.onload = null;
      pendingImageRef.current.onerror = null;
      pendingImageRef.current = null;
    };

    const preloadNextImage = () => {
      const sourceUrl = createSourceUrl();
      resetPendingImage();
      nextBackgroundUrlRef.current = null;

      const img = new Image();
      img.referrerPolicy = 'no-referrer';
      img.onload = () => {
        if (!isCancelled) {
          nextBackgroundUrlRef.current = sourceUrl;
        }
      };
      img.onerror = () => {
        if (!isCancelled) {
          nextBackgroundUrlRef.current = null;
        }
      };
      img.src = sourceUrl;
      pendingImageRef.current = img;
    };

    const scheduleCycle = () => {
      preloadTimerRef.current = setTimeout(() => {
        if (isCancelled) {
          return;
        }
        preloadNextImage();
      }, preloadDelay);

      switchTimerRef.current = setTimeout(() => {
        if (isCancelled) {
          return;
        }
        const incomingUrl = nextBackgroundUrlRef.current;
        setBackgroundUrl(incomingUrl ?? FALLBACK_BACKGROUND_URL);
        nextBackgroundUrlRef.current = null;
        resetPendingImage();
        scheduleCycle();
      }, BACKGROUND_SWITCH_INTERVAL_MS);
    };

    const initializeBackground = () => {
      setBackgroundUrl(FALLBACK_BACKGROUND_URL);
      preloadNextImage();
      switchTimerRef.current = setTimeout(() => {
        if (!isCancelled) {
          setBackgroundUrl(nextBackgroundUrlRef.current ?? FALLBACK_BACKGROUND_URL);
          nextBackgroundUrlRef.current = null;
          resetPendingImage();
          scheduleCycle();
        }
      }, 1000);
    };

    initializeBackground();

    return () => {
      isCancelled = true;
      clearTimers();
      resetPendingImage();
      nextBackgroundUrlRef.current = null;
    };
  }, [isPC]);

  useEffect(() => {
    if (!backgroundUrl || backgroundUrl === FALLBACK_BACKGROUND_URL) {
      return;
    }
    const testImg = new Image();
    testImg.src = backgroundUrl;
    testImg.onerror = () => {
      setBackgroundUrl(FALLBACK_BACKGROUND_URL);
    };
    return () => {
      testImg.onerror = null;
    };
  }, [backgroundUrl]);

  useEffect(() => {
    document.title = `${year}年春节倒计时 - 新年快乐`;
  }, [year]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-ken-burns"
        style={{ 
          backgroundImage: `url("${backgroundUrl}")`,
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
      {/* Audio Player */}
      <AudioPlayer playlist={playlist} />
    </div>
  );
}
