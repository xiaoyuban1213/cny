'use client'

import { getNextLunarNewYear } from '../utils/lunarNewYear';
import { Countdown } from '../components/countdown';
import { AudioPlayer } from '../components/AudioPlayer';
import { useDeviceType } from '../hooks/useDeviceType';
import { SparklesIcon } from 'lucide-react';
import { useEffect} from 'react';

const playlist = [
  { title: "百日", url: "https://c.mmeiblog.cn/d/share/ssd-quick/music/%E7%99%BE%E6%97%A5.flac" },
  { title: "潮声回响", url: "https://c.mmeiblog.cn/d/share/ssd-quick/music/%E6%BD%AE%E5%A3%B0%E5%9B%9E%E5%93%8D.flac" },
  { title: "漂泊于15°的青色回响", url: "https://c.mmeiblog.cn/d/share/ssd-quick/music/%E6%BC%82%E6%B3%8A%E4%BA%8E15%C2%B0%E7%9A%84%E9%9D%92%E8%89%B2%E5%9B%9E%E5%93%8D.flac" },
  { title: "星与梦的诗篇", url: "https://c.mmeiblog.cn/d/share/ssd-quick/music/%E6%98%9F%E4%B8%8E%E6%A2%A6%E7%9A%84%E8%AF%97%E7%AF%87.flac" },
  { title: "明日DISCO", url: "https://c.mmeiblog.cn/d/share/ssd-quick/music/%E6%98%8E%E6%97%A5DISCO.mp3" },
  { title: "心中的永无岛", url: "https://c.mmeiblog.cn/d/share/ssd-quick/music/%E5%BF%83%E4%B8%AD%E7%9A%84%E6%B0%B8%E6%97%A0%E5%B2%9B.flac" },
  { title: "奇遇与你", url: "https://c.mmeiblog.cn/d/share/ssd-quick/music/%E5%A5%87%E9%81%87%E4%B8%8E%E4%BD%A0.flac" },
  { title: "冻夏", url: "https://c.mmeiblog.cn/d/share/ssd-quick/music/%E5%86%BB%E5%A4%8F.mp3" },
  { title: "为谁而歌", url: "https://c.mmeiblog.cn/d/share/ssd-quick/music/%E4%B8%BA%E8%B0%81%E8%80%8C%E6%AD%8C.flac" },
  { title: "中华铄金娘", url: "https://c.mmeiblog.cn/d/share/ssd-quick/music/%E4%B8%AD%E5%8D%8E%E9%93%84%E9%87%91%E5%A8%98.flac" },
  { title: "世末歌者", url: "https://c.mmeiblog.cn/d/share/ssd-quick/music/%E4%B8%96%E6%9C%AB%E6%AD%8C%E8%80%85.mp3" },
  { title: "不再流浪", url: "https://c.mmeiblog.cn/d/share/ssd-quick/music/%E4%B8%8D%E5%86%8D%E6%B5%81%E6%B5%AA.flac" },
  { title: "万分之一的光", url: "https://c.mmeiblog.cn/d/share/ssd-quick/music/%E4%B8%87%E5%88%86%E4%B9%8B%E4%B8%80%E7%9A%84%E5%85%89.flac" },
  { title: "【洛天依】小孩的歌", url: "https://c.mmeiblog.cn/d/share/ssd-quick/music/%E3%80%90%E6%B4%9B%E5%A4%A9%E4%BE%9D%E3%80%91%E5%B0%8F%E5%AD%A9%E7%9A%84%E6%AD%8C.flac" },
];

export default function Home() {
  const nextLunarNewYear = getNextLunarNewYear();
  const isPC = useDeviceType();
  const backgroundUrl = isPC ? 'https://api.mmeiblog.cn/pc?time=true' : 'https://api.mmeiblog.cn/phone?time=true';
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

