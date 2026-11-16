import { useCallback, useState } from "react";
import { z } from "zod";
import {
  PaginatedTradeablesSchema,
  TradeableFieldSchema,
  TradeableSchema,
  type CreateTradeableInput,
  type PaginatedTradeables,
  type TradableType,
  type Tradeable,
  type TradeableField,
  type UpdateTradeableInput,
} from "../schemas/tradeable";
import {
  parseErrorResponse,
  type FormFieldError,
} from "../utils/errorParsing";

export type {
  CreateTradeableInput,
  FormFieldError,
  PaginatedTradeables,
  TradableType,
  Tradeable,
  TradeableField,
  UpdateTradeableInput,
};

const API_BASE_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:5000"
).replace(/\/$/, "");

function parseWithSchema<T>(schema: z.ZodType<T>, raw: unknown): T {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error("La respuesta del servidor no tiene el formato esperado");
  }
  return result.data;
}

export function useTradeables() {
  const [tradeables, setTradeables] = useState<Tradeable[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    FormFieldError<TradeableField>[]
  >([]);

  const handleFailedResponse = useCallback(
    (response: Response): Promise<never> => {
      return parseErrorResponse(response, TradeableFieldSchema).then(
        (parsedError) => {
          if (parsedError.isValidation) {
            setFieldErrors(parsedError.fields);
          } else {
            setFieldErrors([]);
          }
          throw new Error(parsedError.message);
        }
      );
    },
    []
  );

  const parseResponse = useCallback(
    <T,>(response: Response, schema: z.ZodType<T>): Promise<T> => {
      if (!response.ok) {
        return handleFailedResponse(response);
      }

      return response
        .json()
        .then((raw: unknown) => parseWithSchema(schema, raw));
    },
    [handleFailedResponse]
  );

  const fetchTradeables = useCallback(
    (targetPage = 1): Promise<PaginatedTradeables | null> => {
      setLoading(true);
      setError(null);
      setFieldErrors([]);

      return fetch(
        `${API_BASE_URL}/tradeables?page=${encodeURIComponent(targetPage)}`
      )
        .then((response) => parseResponse(response, PaginatedTradeablesSchema))
        .then((data) => {
          setTradeables(data.elements);
          setCount(data.count);
          setPage(targetPage);
          return data;
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Error desconocido");
          return null;
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [parseResponse]
  );

  const getTradeable = useCallback(
    (id: number): Promise<Tradeable | null> => {
      setLoading(true);
      setError(null);
      setFieldErrors([]);

      return fetch(`${API_BASE_URL}/tradeables/${id}`)
        .then((response) => parseResponse(response, TradeableSchema))
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Error desconocido");
          return null;
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [parseResponse]
  );

  const createTradeable = useCallback(
    (payload: CreateTradeableInput): Promise<Tradeable | null> => {
      setLoading(true);
      setError(null);
      setFieldErrors([]);

      return fetch(`${API_BASE_URL}/tradeables`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => parseResponse(response, TradeableSchema))
        .then((created) => {
          setTradeables((prev) => [created, ...prev]);
          setCount((prev) => prev + 1);
          return created;
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Error desconocido");
          return null;
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [parseResponse]
  );

  const updateTradeable = useCallback(
    (id: number, payload: UpdateTradeableInput): Promise<Tradeable | null> => {
      setLoading(true);
      setError(null);
      setFieldErrors([]);

      return fetch(`${API_BASE_URL}/tradeables/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((response) => parseResponse(response, TradeableSchema))
        .then((updated) => {
          setTradeables((prev) =>
            prev.map((item) => (item.id === id ? updated : item))
          );
          return updated;
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Error desconocido");
          return null;
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [parseResponse]
  );

  const deleteTradeable = useCallback(
    (id: number): Promise<boolean> => {
      setLoading(true);
      setError(null);
      setFieldErrors([]);

      return fetch(`${API_BASE_URL}/tradeables/${id}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (!response.ok) {
            return handleFailedResponse(response);
          }

          setTradeables((prev) => prev.filter((item) => item.id !== id));
          setCount((prev) => Math.max(0, prev - 1));
          return true;
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Error desconocido");
          return false;
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [handleFailedResponse]
  );

  return {
    tradeables,
    count,
    page,
    loading,
    error,
    fieldErrors,
    fetchTradeables,
    getTradeable,
    createTradeable,
    updateTradeable,
    deleteTradeable,
  };
}
