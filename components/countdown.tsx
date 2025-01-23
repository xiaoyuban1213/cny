'use client'

import { useState, useEffect } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { Card, CardContent } from "@/components/ui/card"

interface CountdownProps {
  targetDate: Date;
}

export function Countdown({ targetDate }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const days = differenceInDays(targetDate, now);
      const hours = differenceInHours(targetDate, now) % 24;
      const minutes = differenceInMinutes(targetDate, now) % 60;
      const seconds = differenceInSeconds(targetDate, now) % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full px-4">
      {Object.entries(timeLeft).map(([unit, value], index) => (
        <Card key={unit} className="overflow-hidden backdrop-blur-md bg-white/10 border-white/20 animate-scale hover:bg-white/20 transition-all duration-300">
          <CardContent className="flex flex-col items-center justify-center p-6">
            <span className={`text-4xl md:text-5xl font-bold text-white mb-2 animate-pulse ${index % 2 === 0 ? 'animate-float' : 'animate-float-reverse'}`}>
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

