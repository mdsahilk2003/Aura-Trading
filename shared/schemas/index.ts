import { z } from "zod";

export const orderSideSchema = z.enum(["BUY", "SELL"]);
export const orderTypeSchema = z.enum([
  "MARKET",
  "LIMIT",
  "STOP_LOSS",
  "STOP_LOSS_LIMIT",
]);
export const chartTimeframeSchema = z.enum([
  "1D",
  "1W",
  "1M",
  "3M",
  "6M",
  "1Y",
  "5Y",
]);
export const botStrategySchema = z.enum(["MA_CROSSOVER", "RSI", "MOMENTUM"]);

export const placeOrderSchema = z
  .object({
    symbol: z.string().trim().min(1).max(32).toUpperCase(),
    side: orderSideSchema,
    orderType: orderTypeSchema,
    quantity: z.number().int().positive().max(1_000_000),
    price: z.number().positive().optional(),
    triggerPrice: z.number().positive().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      (data.orderType === "LIMIT" || data.orderType === "STOP_LOSS_LIMIT") &&
      data.price == null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Price is required for limit orders",
        path: ["price"],
      });
    }
    if (
      (data.orderType === "STOP_LOSS" ||
        data.orderType === "STOP_LOSS_LIMIT") &&
      data.triggerPrice == null
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Trigger price is required for stop-loss orders",
        path: ["triggerPrice"],
      });
    }
  });

export const modifyOrderSchema = z.object({
  quantity: z.number().int().positive().max(1_000_000).optional(),
  price: z.number().positive().optional(),
  triggerPrice: z.number().positive().optional(),
});

export const watchlistSymbolSchema = z.object({
  symbol: z.string().trim().min(1).max(32).toUpperCase(),
});

export const marketSearchSchema = z.object({
  q: z.string().trim().min(1).max(64),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  side: orderSideSchema.optional(),
  status: z
    .enum([
      "PENDING",
      "OPEN",
      "PARTIALLY_FILLED",
      "FILLED",
      "CANCELLED",
      "REJECTED",
      "FAILED",
    ])
    .optional(),
  search: z.string().trim().max(64).optional(),
});

export const botStartSchema = z.object({
  strategy: botStrategySchema,
  capital: z.number().positive().max(10_000_000),
  maxDailyLoss: z.number().positive().max(1_000_000),
  symbols: z.array(z.string().trim().min(1).max(32).toUpperCase()).min(1).max(10),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s-]{7,20}$/)
    .optional()
    .nullable(),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
export type ModifyOrderInput = z.infer<typeof modifyOrderSchema>;
export type BotStartInput = z.infer<typeof botStartSchema>;
