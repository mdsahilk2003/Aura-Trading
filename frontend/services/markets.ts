import type {
  ChartTimeframe,
  DataMode,
  HistoricalDataDto,
  InstrumentDto,
  MarketStatusDto,
  QuoteDto,
} from "@aura/shared";
import { apiFetch } from "@/lib/api";

export interface MarketInstrument extends InstrumentDto {
  quote?: QuoteDto;
}

export interface MarketsListResponse {
  mode: DataMode;
  provider: string;
  instruments: MarketInstrument[];
}

export interface MarketSearchItem {
  id: string;
  symbol: string;
  name: string;
  exchange: string;
  quote?: QuoteDto;
}

export interface MarketSymbolResponse {
  instrument: InstrumentDto;
  quote: QuoteDto;
}

export interface IndicesResponse {
  mode: DataMode;
  indices: QuoteDto[];
}

export interface MoversResponse {
  mode: DataMode;
  gainers: QuoteDto[];
  losers: QuoteDto[];
}

export const marketsService = {
  list: () => apiFetch<MarketsListResponse>("/api/markets"),

  status: () => apiFetch<MarketStatusDto>("/api/markets/status"),

  search: (q: string, limit = 20) =>
    apiFetch<MarketSearchItem[]>(
      `/api/markets/search?q=${encodeURIComponent(q)}&limit=${limit}`
    ),

  indices: () => apiFetch<IndicesResponse>("/api/markets/indices"),

  movers: () => apiFetch<MoversResponse>("/api/markets/movers"),

  getSymbol: (symbol: string) =>
    apiFetch<MarketSymbolResponse>(`/api/markets/${encodeURIComponent(symbol)}`),

  history: (symbol: string, timeframe: ChartTimeframe = "1D") =>
    apiFetch<HistoricalDataDto>(
      `/api/markets/${encodeURIComponent(symbol)}/history?timeframe=${timeframe}`
    ),
};
