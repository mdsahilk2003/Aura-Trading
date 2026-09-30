import type { ChartTimeframe, OhlcvBar } from "@aura/shared";

/** Seeded PRNG for deterministic demo series per symbol */
export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BASE_PRICES: Record<string, number> = {
  // Indices
  NIFTY50: 24800,
  SENSEX: 81500,
  BANKNIFTY: 52500,

  // Energy & Utilities
  RELIANCE: 2950,
  ONGC: 295,
  NTPC: 410,
  POWERGRID: 261.85,
  BPCL: 345,
  IOC: 175,
  GAIL: 220,
  TATAPOWER: 435,
  ADANIGREEN: 1840,
  ADANIPOWER: 675,

  // Banking & Financials
  HDFCBANK: 1680,
  ICICIBANK: 1285,
  SBIN: 825,
  KOTAKBANK: 1820,
  AXISBANK: 1240,
  BAJFINANCE: 7350,
  CHOLAFIN: 1580,
  JIOFIN: 340,
  MUTHOOTFIN: 1950,
  SHRIRAMFIN: 3120,
  INDUSINDBK: 1420,
  IDFCFIRSTB: 78,

  // IT & Tech
  TCS: 4120,
  INFY: 1890,
  WIPRO: 545,
  HCLTECH: 1780,
  TECHM: 1640,
  LTIM: 6150,
  PERSISTENT: 5420,
  COFORGE: 7850,
  ZOMATO: 275,
  SWIGGY: 420,
  PAYTM: 740,
  NAUKRI: 7650,

  // Auto
  TATAMOTORS: 980,
  MARUTI: 12450,
  "M&M": 3150,
  HEROMOTOCO: 5480,
  EICHERMOT: 4890,
  TVSMOTOR: 2680,
  "BAJAJ-AUTO": 11400,

  // FMCG & Retail
  ITC: 465,
  HINDUNILVR: 2850,
  NESTLEIND: 2540,
  BRITANNIA: 5850,
  VBL: 645,
  ASIANPAINT: 3240,
  TITAN: 3680,
  TRENT: 7650,
  DMART: 4720,
  DABUR: 610,
  GODREJCP: 1420,

  // Pharma
  SUNPHARMA: 1890,
  CIPLA: 1620,
  DRREDDY: 6850,
  DIVISLAB: 5240,
  APOLLOHOSP: 6980,
  MANKIND: 2640,
  LUPIN: 2180,

  // Metals
  TATASTEEL: 158,
  JSWSTEEL: 965,
  HINDALCO: 685,
  COALINDIA: 495,
  VEDL: 485,

  // Infra & Defense
  LT: 3650,
  SIEMENS: 6780,
  ABB: 7850,
  BEL: 285,
  HAL: 4650,
  DLF: 860,
};

export function basePriceFor(symbol: string): number {
  const upper = symbol.toUpperCase();
  if (BASE_PRICES[upper]) return BASE_PRICES[upper];
  const seed = hashSeed(upper);
  return 200 + (seed % 4800);
}

export function timeframeConfig(timeframe: ChartTimeframe): {
  bars: number;
  intervalMs: number;
} {
  switch (timeframe) {
    case "1m":
      return { bars: 60, intervalMs: 1 * 60 * 1000 };
    case "3m":
      return { bars: 60, intervalMs: 3 * 60 * 1000 };
    case "5m":
      return { bars: 60, intervalMs: 5 * 60 * 1000 };
    case "15m":
      return { bars: 50, intervalMs: 15 * 60 * 1000 };
    case "1D":
      return { bars: 78, intervalMs: 5 * 60 * 1000 };
    case "1W":
      return { bars: 35, intervalMs: 60 * 60 * 1000 };
    case "1M":
      return { bars: 30, intervalMs: 24 * 60 * 60 * 1000 };
    case "3M":
      return { bars: 66, intervalMs: 24 * 60 * 60 * 1000 };
    case "6M":
      return { bars: 130, intervalMs: 24 * 60 * 60 * 1000 };
    case "1Y":
      return { bars: 252, intervalMs: 24 * 60 * 60 * 1000 };
    case "5Y":
      return { bars: 260, intervalMs: 5 * 24 * 60 * 60 * 1000 };
    default:
      return { bars: 60, intervalMs: 1 * 60 * 1000 };
  }
}

export function generateOhlcv(
  symbol: string,
  timeframe: ChartTimeframe,
  now = Date.now()
): OhlcvBar[] {
  const { bars, intervalMs } = timeframeConfig(timeframe);
  const rand = mulberry32(hashSeed(`${symbol}:${timeframe}`));
  const basePrice = basePriceFor(symbol);
  const result: OhlcvBar[] = [];

  let currentPrice = basePrice;

  for (let i = bars; i >= 1; i -= 1) {
    const deltaPercent = (rand() - 0.495) * 0.012;
    const open = currentPrice;
    let close = Number(Math.max(1, open * (1 + deltaPercent)).toFixed(2));

    // Clamp price to within 2% of base price to prevent PRNG drift
    if (Math.abs(close - basePrice) / basePrice > 0.02) {
      close = Number((basePrice + (close - basePrice) * 0.3).toFixed(2));
    }
    currentPrice = close;

    const high = Number((Math.max(open, close) * (1 + rand() * 0.004)).toFixed(2));
    const low = Number((Math.min(open, close) * (1 - rand() * 0.004)).toFixed(2));
    const volume = Math.floor(50_000 + rand() * 950_000);

    result.push({
      time: Math.floor((now - i * intervalMs) / 1000),
      open,
      high,
      low,
      close,
      volume,
    });
  }

  return result;
}

export function liveQuoteFromSeries(symbol: string, now = Date.now()) {
  const bars = generateOhlcv(symbol, "1D", now);
  const last = bars[bars.length - 1];
  const prev = bars[bars.length - 2] ?? last;
  // Mild real-time jitter so WS updates feel alive without hardcoding in UI
  const seedVal = hashSeed(`${symbol}:${Math.floor(now / 1200)}`);
  const jitter = ((seedVal % 100) - 49) / 7000;
  const price = Number(Math.max(1, last.close * (1 + jitter)).toFixed(2));
  const change = Number((price - prev.close).toFixed(2));
  const changePercent = Number(((change / prev.close) * 100).toFixed(2));
  return {
    symbol: symbol.toUpperCase(),
    price,
    change,
    changePercent,
    open: bars[0].open,
    high: Math.max(...bars.map((b) => b.high), price),
    low: Math.min(...bars.map((b) => b.low), price),
    previousClose: prev.close,
    volume: bars.reduce((sum, b) => sum + b.volume, 0),
    timestamp: new Date(now).toISOString(),
  };
}
