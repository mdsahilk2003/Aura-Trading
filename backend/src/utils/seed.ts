import { Instrument } from "../models/Instrument";
import { Strategy } from "../models/Strategy";

const SEED_INSTRUMENTS = [
  // Top Indices
  { symbol: "NIFTY50", name: "Nifty 50 Index", segment: "INDEX", sector: "Index" },
  { symbol: "SENSEX", name: "S&P BSE Sensex", segment: "INDEX", sector: "Index" },
  { symbol: "BANKNIFTY", name: "Nifty Bank Index", segment: "INDEX", sector: "Index" },

  // Energy & Utilities
  { symbol: "RELIANCE", name: "Reliance Industries Ltd", sector: "Energy" },
  { symbol: "ONGC", name: "Oil & Natural Gas Corp", sector: "Energy" },
  { symbol: "NTPC", name: "NTPC Limited", sector: "Utilities" },
  { symbol: "POWERGRID", name: "Power Grid Corp of India", sector: "Utilities" },
  { symbol: "BPCL", name: "Bharat Petroleum Corp Ltd", sector: "Energy" },
  { symbol: "IOC", name: "Indian Oil Corporation Ltd", sector: "Energy" },
  { symbol: "GAIL", name: "GAIL (India) Ltd", sector: "Energy" },
  { symbol: "TATAPOWER", name: "Tata Power Company Ltd", sector: "Utilities" },
  { symbol: "ADANIGREEN", name: "Adani Green Energy Ltd", sector: "Utilities" },
  { symbol: "ADANIPOWER", name: "Adani Power Ltd", sector: "Utilities" },

  // Banking & Financial Services
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd", sector: "Banking" },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd", sector: "Banking" },
  { symbol: "SBIN", name: "State Bank of India", sector: "Banking" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank Ltd", sector: "Banking" },
  { symbol: "AXISBANK", name: "Axis Bank Ltd", sector: "Banking" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance Ltd", sector: "Finance" },
  { symbol: "CHOLAFIN", name: "Cholamandalam Investment", sector: "Finance" },
  { symbol: "JIOFIN", name: "Jio Financial Services Ltd", sector: "Finance" },
  { symbol: "MUTHOOTFIN", name: "Muthoot Finance Ltd", sector: "Finance" },
  { symbol: "SHRIRAMFIN", name: "Shriram Finance Ltd", sector: "Finance" },
  { symbol: "INDUSINDBK", name: "IndusInd Bank Ltd", sector: "Banking" },
  { symbol: "IDFCFIRSTB", name: "IDFC First Bank Ltd", sector: "Banking" },

  // IT & Technology
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT" },
  { symbol: "INFY", name: "Infosys Ltd", sector: "IT" },
  { symbol: "WIPRO", name: "Wipro Ltd", sector: "IT" },
  { symbol: "HCLTECH", name: "HCL Technologies Ltd", sector: "IT" },
  { symbol: "TECHM", name: "Tech Mahindra Ltd", sector: "IT" },
  { symbol: "LTIM", name: "LTIMindtree Ltd", sector: "IT" },
  { symbol: "PERSISTENT", name: "Persistent Systems Ltd", sector: "IT" },
  { symbol: "COFORGE", name: "Coforge Ltd", sector: "IT" },
  { symbol: "ZOMATO", name: "Zomato Ltd", sector: "New Age Tech" },
  { symbol: "SWIGGY", name: "Swiggy Ltd", sector: "New Age Tech" },
  { symbol: "PAYTM", name: "One97 Communications (Paytm)", sector: "Fintech" },
  { symbol: "NAUKRI", name: "Info Edge (India) Ltd", sector: "Tech" },

  // Automotive
  { symbol: "TATAMOTORS", name: "Tata Motors Ltd", sector: "Automobile" },
  { symbol: "MARUTI", name: "Maruti Suzuki India Ltd", sector: "Automobile" },
  { symbol: "M&M", name: "Mahindra & Mahindra Ltd", sector: "Automobile" },
  { symbol: "HEROMOTOCO", name: "Hero MotoCorp Ltd", sector: "Automobile" },
  { symbol: "EICHERMOT", name: "Eicher Motors Ltd", sector: "Automobile" },
  { symbol: "TVSMOTOR", name: "TVS Motor Company Ltd", sector: "Automobile" },
  { symbol: "BAJAJ-AUTO", name: "Bajaj Auto Ltd", sector: "Automobile" },

  // FMCG & Consumer Retail
  { symbol: "ITC", name: "ITC Ltd", sector: "FMCG" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd", sector: "FMCG" },
  { symbol: "NESTLEIND", name: "Nestle India Ltd", sector: "FMCG" },
  { symbol: "BRITANNIA", name: "Britannia Industries Ltd", sector: "FMCG" },
  { symbol: "VBL", name: "Varun Beverages Ltd", sector: "Consumer" },
  { symbol: "ASIANPAINT", name: "Asian Paints Ltd", sector: "Consumer" },
  { symbol: "TITAN", name: "Titan Company Ltd", sector: "Consumer" },
  { symbol: "TRENT", name: "Trent Ltd", sector: "Retail" },
  { symbol: "DMART", name: "Avenue Supermarts (DMart)", sector: "Retail" },
  { symbol: "DABUR", name: "Dabur India Ltd", sector: "FMCG" },
  { symbol: "GODREJCP", name: "Godrej Consumer Products Ltd", sector: "FMCG" },

  // Healthcare & Pharmaceuticals
  { symbol: "SUNPHARMA", name: "Sun Pharmaceutical Industries", sector: "Pharma" },
  { symbol: "CIPLA", name: "Cipla Ltd", sector: "Pharma" },
  { symbol: "DRREDDY", name: "Dr. Reddy's Laboratories", sector: "Pharma" },
  { symbol: "DIVISLAB", name: "Divi's Laboratories Ltd", sector: "Pharma" },
  { symbol: "APOLLOHOSP", name: "Apollo Hospitals Enterprise", sector: "Healthcare" },
  { symbol: "MANKIND", name: "Mankind Pharma Ltd", sector: "Pharma" },
  { symbol: "LUPIN", name: "Lupin Ltd", sector: "Pharma" },

  // Metals & Mining
  { symbol: "TATASTEEL", name: "Tata Steel Ltd", sector: "Metals" },
  { symbol: "JSWSTEEL", name: "JSW Steel Ltd", sector: "Metals" },
  { symbol: "HINDALCO", name: "Hindalco Industries Ltd", sector: "Metals" },
  { symbol: "COALINDIA", name: "Coal India Ltd", sector: "Mining" },
  { symbol: "VEDL", name: "Vedanta Ltd", sector: "Metals" },

  // Engineering, Defense & Infra
  { symbol: "LT", name: "Larsen & Toubro Ltd", sector: "Infrastructure" },
  { symbol: "SIEMENS", name: "Siemens Ltd", sector: "Capital Goods" },
  { symbol: "ABB", name: "ABB India Ltd", sector: "Capital Goods" },
  { symbol: "BEL", name: "Bharat Electronics Ltd", sector: "Defense" },
  { symbol: "HAL", name: "Hindustan Aeronautics Ltd", sector: "Defense" },
  { symbol: "DLF", name: "DLF Ltd", sector: "Realty" },
];

export async function seedInstruments() {
  for (const item of SEED_INSTRUMENTS) {
    await Instrument.findOneAndUpdate(
      { symbol: item.symbol },
      {
        symbol: item.symbol,
        name: item.name,
        exchange: "NSE",
        segment: item.segment || "EQ",
        lotSize: 1,
        tickSize: 0.05,
        sector: item.sector,
        isActive: true,
      },
      { upsert: true }
    );
  }

  const strategies = [
    {
      key: "MA_CROSSOVER" as const,
      name: "Moving Average Crossover",
      description: "Buys when fast MA crosses above slow MA",
      parameters: { fast: 5, slow: 20 },
    },
    {
      key: "RSI" as const,
      name: "RSI",
      description: "Mean-reversion using Relative Strength Index",
      parameters: { period: 14, oversold: 30, overbought: 70 },
    },
    {
      key: "MOMENTUM" as const,
      name: "Momentum",
      description: "Trades short-term price momentum",
      parameters: { lookback: 5, threshold: 1.5 },
    },
  ];

  for (const s of strategies) {
    await Strategy.findOneAndUpdate({ key: s.key }, s, { upsert: true });
  }
}

if (require.main === module || process.argv[1]?.includes("seed")) {
  const { connectDatabase } = require("../config/database");
  connectDatabase()
    .then(() => seedInstruments())
    .then(() => {
      console.log("Successfully seeded 75+ instruments into Mongo database!");
      process.exit(0);
    })
    .catch((err: any) => {
      console.error("Seed error", err);
      process.exit(1);
    });
}
