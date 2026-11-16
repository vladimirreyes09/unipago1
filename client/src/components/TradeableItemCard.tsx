import { useState } from "react";
import type { Tradeable } from "../schemas/tradeable";

interface TradeableItemCardProps {
  tradeable: Tradeable;
  onDelete: (id: number) => Promise<boolean>;
  onEdit?: (tradeable: Tradeable) => void;
}

export function TradeableItemCard({
  tradeable,
  onDelete,
  onEdit,
}: TradeableItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    onDelete(tradeable.id).finally(() => {
      setIsDeleting(false);
    });
  };

  return (
    <article className="tradeable-card">
      <div className="tradeable-card-header">
        <code className="tradeable-symbol">{tradeable.symbol}</code>
        <span className="tradeable-type">{tradeable.tradable_type}</span>
      </div>

      <h3 className="tradeable-name">{tradeable.name}</h3>

      <div className="tradeable-card-actions">
        {onEdit && (
          <button
            type="button"
            className="card-action-button"
            onClick={() => onEdit(tradeable)}
            disabled={isDeleting}
          >
            Editar
          </button>
        )}
        <button
          type="button"
          className="card-action-button delete-button"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </article>
  );
}
