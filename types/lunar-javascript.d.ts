declare module 'lunar-javascript' {
    export class Lunar {
      static fromSolar(solar: Solar): Lunar {
        throw new Error('Method not implemented.');
      }
      static fromDate(date: Date): Lunar;
      getMonth(): number;
      getDay(): number;
    }
  
    export class Solar {
      static fromLunar(lunarNewYear: Lunar) {
        throw new Error('Method not implemented.');
      }
      static fromYmd(year: number, month: number, day: number): Solar;
    }
  }
  
  