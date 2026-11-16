import { useEffect, useRef } from "react";
import type { Tradeable } from "../schemas/tradeable";
import { TradeableItemCard } from "./TradeableItemCard";

interface TradeableListProps {
  tradeables: Tradeable[];
  count: number;
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  onLoadMore: () => void;
  onDelete: (id: number) => Promise<boolean>;
  onEdit?: (tradeable: Tradeable) => void;
}

export function TradeableList({
  tradeables,
  count,
  loading,
  hasMore,
  error,
  onLoadMore,
  onDelete,
  onEdit,
}: TradeableListProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || loading) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          onLoadMore();
        }
      },
      { rootMargin: "100px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  return (
    <div className="tradeable-list-container">
      <div className="tradeable-list-header">
        <h2>Activos registrados</h2>
        <span className="tradeable-count">{count}</span>
      </div>

      {error && (
        <p className="form-error list-status" role="alert">
          {error}
        </p>
      )}

      {!loading && !error && tradeables.length === 0 && (
        <p className="list-status">No hay activos registrados todavía.</p>
      )}

      {tradeables.length > 0 && (
        <div className="tradeable-grid">
          {tradeables.map((tradeable) => (
            <TradeableItemCard
              key={tradeable.id}
              tradeable={tradeable}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </div>
      )}

      {loading && <p className="list-status">Cargando activos...</p>}

      {hasMore && (
        <div
          ref={sentinelRef}
          className="scroll-sentinel"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
