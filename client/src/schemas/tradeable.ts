import { z } from "zod";

export const TradableTypeSchema = z.enum([
  "CryptoCurrency",
  "Commodity",
  "Future",
  "TradableStock",
  "PublicStock",
  "PrivateStock",
]);

export const TradeableBaseSchema = z.object({
  name: z
    .string({ message: "Debe ser un texto" })
    .min(1, "Debe tener un nombre")
    .max(200, "El nombre no debe tener más de 200 caracteres"),
  symbol: z
    .string({ message: "Debe ser un texto" })
    .min(1, "Debe tener un símbolo")
    .max(200, "El símbolo no debe tener más de 200 caracteres"),
  tradable_type: TradableTypeSchema,
});

export const TradeableSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  symbol: z.string(),
  tradable_type: TradableTypeSchema,
});

export const CreateTradeableSchema = TradeableBaseSchema;
export const UpdateTradeableSchema = TradeableBaseSchema.partial();
export const TradeableFieldSchema = TradeableBaseSchema.keyof();

export const PaginatedTradeablesSchema = z.object({
  count: z.number().int().nonnegative(),
  elements: z.array(TradeableSchema),
});

export type TradableType = z.infer<typeof TradableTypeSchema>;
export type Tradeable = z.infer<typeof TradeableSchema>;
export type TradeableField = z.infer<typeof TradeableFieldSchema>;
export type PaginatedTradeables = z.infer<typeof PaginatedTradeablesSchema>;
export type CreateTradeableInput = z.infer<typeof CreateTradeableSchema>;
export type UpdateTradeableInput = z.infer<typeof UpdateTradeableSchema>;
