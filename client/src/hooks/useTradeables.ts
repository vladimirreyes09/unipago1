import { useCallback, useRef, useState } from "react";
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
  (import.meta.env.VITE_API_URL as string | undefined) ?? "/api"
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
  const tradeablesRef = useRef<Tradeable[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
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
          const prev = tradeablesRef.current;
          const nextList =
            targetPage === 1
              ? data.elements
              : [
                  ...prev,
                  ...data.elements.filter(
                    (item) => !prev.some((existing) => existing.id === item.id)
                  ),
                ];

          tradeablesRef.current = nextList;
          setTradeables(nextList);
          setHasMore(data.elements.length > 0 && nextList.length < data.count);
          setCount(data.count);
          setPage(targetPage);
          return data;
        })
        .catch((err: unknown) => {
          setHasMore(false);
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
          const nextList = [created, ...tradeablesRef.current];
          tradeablesRef.current = nextList;
          setTradeables(nextList);
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
          const nextList = tradeablesRef.current.map((item) =>
            item.id === id ? updated : item
          );
          tradeablesRef.current = nextList;
          setTradeables(nextList);
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

          const nextList = tradeablesRef.current.filter(
            (item) => item.id !== id
          );
          tradeablesRef.current = nextList;
          setTradeables(nextList);
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
    hasMore,
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
