'use client'

import { useState, useEffect } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card"

interface CountdownProps {
  targetDate: Date;
}

// 计算剩余时间（服务端渲染时同步执行，首屏 HTML 直接显示真实值，改善 LCP）
function getTimeLeft(targetDate: Date) {
  const now = new Date();
  return {
    days: differenceInDays(targetDate, now),
    hours: differenceInHours(targetDate, now) % 24,
    minutes: differenceInMinutes(targetDate, now) % 60,
    seconds: differenceInSeconds(targetDate, now) % 60,
  };
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full px-4">
      {Object.entries(timeLeft).map(([unit, value], index) => (
        <Card key={unit} className="overflow-hidden backdrop-blur-md bg-white/10 border-white/20 animate-scale hover:bg-white/20 transition-all duration-300">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <span suppressHydrationWarning className={`text-4xl md:text-5xl font-bold text-white mb-2 animate-pulse ${index % 2 === 0 ? 'animate-float' : 'animate-float-reverse'}`}>
              {value.toString().padStart(2, '0')}
            </span>
            <span className="text-sm text-white/80 capitalize">
              {unit}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

