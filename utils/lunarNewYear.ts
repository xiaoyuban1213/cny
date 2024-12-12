/// <reference path="../types/lunar-javascript.d.ts" />
import { Lunar, Solar } from 'lunar-javascript';

export function getNextLunarNewYear(): Date {
  const now = new Date();
  let year = now.getFullYear();
  let lunar = Lunar.fromDate(now);

  // 如果现在已经过了今年的春节，就计算下一年的
  if (lunar.getMonth() !== 1 || lunar.getDay() !== 1) {
    year++;
  }

  // 找到下一个春节的日期
  while (true) {
    for (let month = 1; month <= 2; month++) {
      for (let day = 1; day <= 31; day++) {
        const date = new Date(year, month - 1, day);
        lunar = Lunar.fromDate(date); // 直接使用 Lunar.fromDate 进行转换
        if (lunar.getMonth() === 1 && lunar.getDay() === 1) {
          return date;
        }
      }
    }
    year++; // 如果在当前年份没找到，继续查找下一年
  }
}