'use client'

import { getNextLunarNewYear } from '../utils/lunarNewYear';
import { Countdown } from '../components/countdown';
import { AudioPlayer } from '../components/AudioPlayer';
import { useDeviceType } from '../hooks/useDeviceType';
import { SparklesIcon } from 'lucide-react';
import { useEffect} from 'react';

const playlist = [
  { title: "春节序曲", url: "https://c.mmeiblog.cn/d/nas/pa/Document/New/2002%E5%B9%B4%E7%9A%84%E7%AC%AC%E4%B8%80%E5%9C%BA%E9%9B%AA-%E5%88%80%E9%83%8E.flac?sign=tXOMg_rZe8Sk2fXToQjYWUB5ohLbyBG4eMad3n_WHJI=:0" },
  { title: "新年好", url: "https://example.com/path/to/your/audio2.mp3" },
  { title: "恭喜发财", url: "https://example.com/path/to/your/audio3.mp3" },
];

export default function Home() {
  const nextLunarNewYear = getNextLunarNewYear();
  const isPC = useDeviceType();
  const backgroundUrl = isPC ? 'https://api.mmeiblog.cn/pc' : 'https://api.mmeiblog.cn/phone';
  const year = nextLunarNewYear.getFullYear();

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

      <div className="absolute top-4 right-4 text-yellow-500 animate-float">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
          <path d="M10.5 1.875a1.125 1.125 0 012.25 0v8.219c.517.162 1.02.382 1.5.659V3.375a1.125 1.125 0 012.25 0v10.937a1.125 1.125 0 01-2.25 0V8.287a6.474 6.474 0 00-3 0v6.025a1.125 1.125 0 01-2.25 0V3.375a1.125 1.125 0 012.25 0v5.878c.501-.287 1.007-.513 1.5-.674V1.875z" />
          <path d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zm1.5 0a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0zM18 12.75a.75.75 0 100-1.5.75.75 0 000 1.5z" />
          <path d="M12 1.5a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5A.75.75 0 0112 1.5zm-.75 11.25a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H11.25z" />
        </svg>
      </div>

      {/* Audio Player */}
      <AudioPlayer playlist={playlist} />
    </div>
  );
}

