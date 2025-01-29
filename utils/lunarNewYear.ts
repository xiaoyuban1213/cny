/// <reference path="../types/lunar-javascript.d.ts" />
import { Lunar, Solar } from 'lunar-javascript';

export function getNextLunarNewYear(): Date {
  const now = new Date();
  // 将当前时间转换为当天的0点，以便只比较日期部分
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let year = now.getFullYear();

  while (true) {
    // 构造农历年的正月初一
    const lunarNewYear = Lunar.fromYmd(year, 1, 1);
    const solarDate = lunarNewYear.getSolar();
    // 转换为公历日期对象（月份需要减1，因为JavaScript的Date月份从0开始）
    const lunarNewYearDate = new Date(solarDate.getYear(), solarDate.getMonth() - 1, solarDate.getDay());

    // 检查该日期是否大于当前日期的0点
    if (lunarNewYearDate > nowDate) {
      return lunarNewYearDate;
    }
    // 继续检查下一年
    year++;
  }
}