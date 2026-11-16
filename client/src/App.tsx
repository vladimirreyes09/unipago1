import { useCallback, useEffect, useState } from "react";
import "./App.css";
import { TradeableForm } from "./components/TradeableForm";
import { TradeableList } from "./components/TradeableList";
import { useTradeables, type Tradeable } from "./hooks/useTradeables";

function App() {
  const {
    tradeables,
    count,
    page,
    hasMore,
    loading,
    error,
    fieldErrors,
    fetchTradeables,
    createTradeable,
    updateTradeable,
    deleteTradeable,
  } = useTradeables();

  const [editingTradeable, setEditingTradeable] = useState<Tradeable | null>(
    null
  );

  useEffect(() => {
    fetchTradeables(1);
  }, [fetchTradeables]);

  const handleLoadMore = useCallback(() => {
    fetchTradeables(page + 1);
  }, [fetchTradeables, page]);

  const handleDelete = useCallback(
    (id: number) => {
      return deleteTradeable(id).then((deleted) => {
        if (deleted && editingTradeable?.id === id) {
          setEditingTradeable(null);
        }
        return deleted;
      });
    },
    [deleteTradeable, editingTradeable]
  );

  return (
    <>
      <section id="center">
        <div className="hero">
          <h1>Registro de activos transables</h1>
        </div>
        <TradeableForm
          key={editingTradeable?.id ?? "new"}
          tradeable={editingTradeable}
          loading={loading}
          error={error}
          fieldErrors={fieldErrors}
          onCreate={createTradeable}
          onUpdate={updateTradeable}
          onCancelEdit={() => setEditingTradeable(null)}
          onSuccess={() => setEditingTradeable(null)}
        />
      </section>

      <div className="ticks" />

      <section className="tradeables-section">
        <TradeableList
          tradeables={tradeables}
          count={count}
          loading={loading}
          hasMore={hasMore}
          error={error}
          onLoadMore={handleLoadMore}
          onDelete={handleDelete}
          onEdit={setEditingTradeable}
        />
      </section>

      <div className="ticks" />
      <section id="spacer" />
    </>
  );
}

export default App;
