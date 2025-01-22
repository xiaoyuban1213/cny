/// <reference path="../types/lunar-javascript.d.ts" />
import { Lunar, Solar } from 'lunar-javascript';

export function getNextLunarNewYear(): Date {
  const now = new Date();
  let year = now.getFullYear();
  let found = false;

  // 如果现在已经过了今年的春节，就计算下一年的
  while (!found) {
    for (let month = 1; month <= 12; month++) {
      for (let day = 1; day <= 30; day++) {
        const date = new Date(year, month - 1, day);
        const lunar = Lunar.fromDate(date);
        if (lunar.getMonth() === 1 && lunar.getDay() === 1) {
          return date;
        }
      }
    }
    year++; // 如果在当前年份没找到，继续查找下一年
  }

  throw new Error('未能找到春节日期');
}