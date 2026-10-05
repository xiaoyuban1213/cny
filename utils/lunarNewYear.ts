/// <reference path="../types/lunar-javascript.d.ts" />
import { Lunar } from 'lunar-javascript';

export function getNextLunarNewYear(referenceDate = new Date()): Date {
  const currentDate = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate()
  );
  let lunarYear = referenceDate.getFullYear();

  while (true) {
    const lunarNewYear = Lunar.fromYmd(lunarYear, 1, 1);
    const solarDate = lunarNewYear.getSolar();
    const lunarNewYearDate = new Date(solarDate.getYear(), solarDate.getMonth() - 1, solarDate.getDay());

    if (lunarNewYearDate > currentDate) {
      return lunarNewYearDate;
    }
    lunarYear += 1;
  }
}